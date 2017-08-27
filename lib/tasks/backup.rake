namespace :db do
  desc "This task backs up the Mongo DB to local dump."
  task :backup do
    sh("mongodump --db makerauth --archive=dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive")
    GoogleDrive::Session.from_config("config.json").upload_from_file(Rails.root.join("dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive").to_s, "makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive", convert: false)
  end
end
