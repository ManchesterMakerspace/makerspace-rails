namespace :db do
  desc "This task backs up the Mongo DB to local dump as compressed gzip."
  task :backup do
    sh("mongodump --db makerauth --archive | gzip > /home/putter/server/makerspace_interface/dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.gz")
    GoogleDrive::Session.from_config("config.json").upload_from_file("/home/putter/server/makerspace-interface/dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.gz", "makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.gz", convert: false)
  end
end
