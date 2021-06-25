desc "Updates boolean fields to datetime"
task :time_update => :environment do 
  drive = ::Service::GoogleDrive.load_gdrive
  templates = ::Service::GoogleDrive.get_templates()
  member_contract_folder = templates[:member_contract][:folder_id]
  rental_contract_folder = templates[:rental_agreement][:folder_id]

  members = Member.all 
  rentals = Rental.all 

  member_contracts = drive.list_files(
    q: "'#{member_contract_folder}' in parents",
    fields: "files(id, name)"
  )

  member_contracts.files.each do |contract|
    member_name, date_ext = contract.name.split("_member_contract_")
    date_str, ext = date_ext.split(".")
    date = Date.strptime(date_str, '%m-%d-%Y')

    member = members.find { |m| m.fullname == member_name }

    unless member.nil? 
      member.memberContractOnFile = nil
      if member.member_contract_signed_date.nil? || member.member_contract_signed_date < date 
        member.member_contract_signed_date = date
      end
      member.save!
    end
  end

  rental_contracts = drive.list_files(
    q: "'#{rental_contract_folder}' in parents",
    fields: "files(id, name)"
  )

  rental_contracts.files.each do |contract|
    member_name, date_ext = contract.name.split("_rental_agreement_")
    date_str, ext = date_ext.split(".")
    date = Date.strptime(date_str, '%m-%d-%Y')

    rental = rentals.find { |r| r.member.fullname == member_name }

    unless rental.nil?
      rental.contract_on_file = nil 
      if rental.contract_signed_date.nil? || rental.contract_signed_date < date 
        rental.contract_signed_date = date
      end
      rental.save!
    end
  end
end