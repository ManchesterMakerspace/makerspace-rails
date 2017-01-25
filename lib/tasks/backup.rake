namespace :db do
  desc "This task backs up the Mongo DB to local dump as compressed gzip."
  task :backupMembers do
    sh("mongodump --db makerauth --collection members --out - | gzip > /home/will/Desktop/dev/makerspace_interface/dump/members/memberBackup_#{Time.now.strftime('%m-%d-%Y')}.gz")
    GoogleDrive::Session.from_config("config.json").upload_from_file("/home/will/Desktop/dev/makerspace_interface/dump/members/memberBackup_#{Time.now.strftime('%m-%d-%Y')}.gzip", "memberBackup_#{Time.now.strftime('%m-%d-%Y')}.gzip", convert: false)
  end

  task :backupWorkshops do
    sh("mongodump --db makerauth --collection workshops --out - | gzip > /home/will/Desktop/dev/makerspace_interface/dump/workshops/workshopBackup_#{Time.now.strftime('%m-%d-%Y')}.gzip")
    GoogleDrive::Session.from_config("config.json").upload_from_file("/home/will/Desktop/dev/makerspace_interface/dump/members/memberBackup_#{Time.now.strftime('%m-%d-%Y')}.gzip", "memberBackup_#{Time.now.strftime('%m-%d-%Y')}.gzip", convert: false)
  end

  task :backupSkills do
    sh("mongodump --db makerauth --collection skills --out - | gzip > /home/will/Desktop/dev/makerspace_interface/dump/skills/skillBackup_#{Time.now.strftime('%m-%d-%Y')}.gzip")
    GoogleDrive::Session.from_config("config.json").upload_from_file("/home/will/Desktop/dev/makerspace_interface/dump/members/memberBackup_#{Time.now.strftime('%m-%d-%Y')}.gzip", "memberBackup_#{Time.now.strftime('%m-%d-%Y')}.gzip", convert: false)
  end
end
