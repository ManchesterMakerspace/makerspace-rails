desc "Updates boolean fields to datetime"
task :time_update => :environment do 
  drive = ::Service::GoogleDrive.load_gdrive
  templates = ::Service::GoogleDrive.get_templates()
  member_contract_folder = ::Service::GoogleDrive.get_folder_id(
    templates[:member_contract][:folder_id])
  rental_contract_folder = ::Service::GoogleDrive.get_folder_id(
    templates[:rental_agreement][:folder_id])

  members = Member.all 
  rentals = Rental.all 

  member_contracts = drive.list_files(
    q: "'#{member_contract_folder}' in parents",
    fields: "files(id, name)"
  )

  member_contracts.files.each do |contract|
    member_name, date_ext = contract.name.split("_member_contract_")
    unless date_ext.nil?
      date_str, ext = date_ext.split(".")
      date = Date.strptime(date_str, '%m-%d-%Y')

      member = members.find { |m| m.fullname == member_name }

      unless member.nil? 
        member.memberContractOnFile = nil
        if member.member_contract_signed_date.nil? || member.member_contract_signed_date < date 
          member.member_contract_signed_date = date
          puts "Updataing #{member.fullname} signed member contract date to #{date}"
        end
        member.save!
      end
    end
  end

  rental_contracts = drive.list_files(
    q: "'#{rental_contract_folder}' in parents",
    fields: "files(id, name)"
  )

  rental_contracts.files.each do |contract|
    member_name, date_ext = contract.name.split("_rental_agreement_")
    unless date_ext.nil?
      date_str, ext = date_ext.split(".")
      date = Date.strptime(date_str, '%m-%d-%Y')

      member = members.find { |m| m.fullname == member_name }

      if member.rentals.length > 1
        puts "#{member.fullname} has too many rentals to auto update"
      else
        rental = member.rentals.first
        unless rental.nil?
          rental.contract_on_file = nil 
          if rental.contract_signed_date.nil? || rental.contract_signed_date < date 
            rental.contract_signed_date = date
            puts "Updataing #{member_name} signed rental contract date to #{date}"
          end
          rental.save!
        end
      end
    end
  end
end