namespace :db do
  desc "This task backs up the Mongo DB to local dump as compressed gzip."
  task :backupMembers do
    sh("mongodump --db makerauth --collection members --out - | gzip > /home/will/Desktop/dev/makerspace_interface/dump/members/memberBackup-#{Time.now.strftime('%m-%d-%Y')}.gzip")
  end

  task :backupWorkshops do
    sh("mongodump --db makerauth --collection workshops --out - | gzip > /home/will/Desktop/dev/makerspace_interface/dump/workshops/workshopBackup-#{Time.now.strftime('%m-%d-%Y')}.gzip")
  end

  task :backupSkills do
    sh("mongodump --db makerauth --collection skills --out - | gzip > /home/will/Desktop/dev/makerspace_interface/dump/skills/skillBackup-#{Time.now.strftime('%m-%d-%Y')}.gzip")
  end
end
