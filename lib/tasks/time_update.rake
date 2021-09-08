desc "Updates boolean fields to datetime"
task :time_update => :environment do 
  drive = ::Service::GoogleDrive.load_gdrive
  templates = ::Service::GoogleDrive.get_templates()
  member_contract_folder = ::Service::GoogleDrive.get_folder_id(
    templates[:member_contract][:folder_id])
  rental_contract_folder = ::Service::GoogleDrive.get_folder_id(
    templates[:rental_agreement][:folder_id])

  members = Member.all.to_a
  rentals = Rental.all.to_a

  failed_member_updates = 0
  success_member_updates = 0
  failed_rental_updates = 0
  success_rental_updates = 0

  member_contracts = drive.list_files(
    q: "'#{member_contract_folder}' in parents",
    fields: "files(id, name)",
    page_size: 1000
  )

  puts "Found #{member_contracts.files.length} member contracts"

  member_contracts.files.each do |contract|
    member_name, date_ext = contract.name.split("_member_contract_")
    unless date_ext.nil?
      date_str, ext = date_ext.split(".")
      date = Date.strptime(date_str, '%m-%d-%Y')

      member = members.find { |m| m.fullname.downcase.strip == member_name.downcase.strip }

      unless member.nil? 
        member.reload

        member.remove_attribute(:memberContractOnFile)

        if member.member_contract_signed_date.nil? || member.member_contract_signed_date < date 
          member.member_contract_signed_date = date
          puts "Updating #{member.fullname} signed member contract date to #{date}"
        end
        member.save!
        success_member_updates += 1
      else 
        puts "No member found for #{member_name}"
        failed_member_updates += 1
      end
    else 
      puts "Failed to extract date for #{contract.name}"
      failed_member_updates += 1
    end
  end

  rental_contracts = drive.list_files(
    q: "'#{rental_contract_folder}' in parents",
    fields: "files(id, name)",
    page_size: 1000
  )

  puts "Found #{rental_contracts.files.length} rental contracts"

  rental_contracts.files.each do |contract|
    member_name, date_ext = contract.name.split("_rental_agreement_")
    unless date_ext.nil?
      date_str, ext = date_ext.split(".")
      date = Date.strptime(date_str, '%m-%d-%Y')

      member = members.find { |m| m.fullname.downcase.strip == member_name.downcase.strip }

      unless member.nil? 
        member.reload

        if member.rentals.length > 1
          puts "#{member.fullname} has too many rentals to auto update"
        else
          rental = member.rentals.first
          unless rental.nil?
            rental.remove_attribute(:contract_on_file)
            if rental.contract_signed_date.nil? || rental.contract_signed_date < date 
              rental.contract_signed_date = date
              puts "Updating #{member_name} signed rental contract date to #{date}"
            end
            rental.save!
            success_rental_updates += 1
          else 
            puts "No rental found for #{member_name}"
            failed_rental_updates += 1
          end
        end
      else 
        puts "No member found for #{member_name}"
        failed_rental_updates += 1
      end
    else 
      puts "Failed to extract date for #{contract.name}"
      failed_rental_updates += 1
    end
  end

  puts "Successful Member Updates: #{success_member_updates}"
  puts "Failed Member Updates: #{failed_member_updates}"
  puts "Total Members: #{members.length}"
  puts "Successful Rental Updates: #{success_rental_updates}"
  puts "Failed Rental Updates: #{failed_rental_updates}"
  puts "Total Rentals: #{rentals.length}"
end