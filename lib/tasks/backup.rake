desc "This task is called by the Heroku scheduler add-on and backs up the Mongo DB to local dump."
task :backup => :environment do
  begin
    file_name = "makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive"
    sh("mongodump --uri #{ENV['MLAB_URI']} --archive=dump/#{file_name}")
    Service::GoogleDrive.upload_backup(file_name)
    slack_message = "Daily backup complete."

  rescue => e
    error = "#{e.message}\n#{e.backtrace.inspect}"
    slack_message = "Error backing up database: #{error}"
  end

  ::Service::SlackConnector.send_slack_message(slack_message, ::Service::SlackConnector.logs_channel)
end
