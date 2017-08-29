namespace :db do
  desc "This task backs up the Mongo DB to local dump."
  task :backup do
    sh("mongodump --db makerauth --archive=dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive")
    credentials = Google::Auth::UserRefreshCredentials.new(JSON.parse(ENV['GDRIVE_CREDS']))
    session = GoogleDrive.login_with_oauth(credentials)
    session.upload_from_file(Rails.root.join("dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive").to_s, "makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive", convert: false)
  end
end
