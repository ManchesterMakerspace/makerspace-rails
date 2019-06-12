desc "This task is called by the Heroku scheduler add-on and backs up the Mongo DB to local dump."
task :backup => :environment do
  notifier = Slack::Web::Client.new(token: ENV['SLACK_ADMIN_TOKEN'])
  begin
    file_name = "makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive"
    sh("mongodump --uri #{ENV['MLAB_URI']} --archive=dump/#{file_name}")
    Service::GoogleDrive.upload_backup(file_name)
    slack_message = "Daily backup complete."

  rescue => e
    error = "#{e.message}\n#{e.backtrace.inspect}"
    slack_message = "Error backing up database: #{error}"
  end

  channel = Rails.env.production? ? "interface-logs" : "test_channel"

  notifier.chat_postMessage(
    channel: channel,
    text: slack_message,
    as_user: false,
    username: 'Management Bot',
    icon_emoji: ':ghost:'
  )
end

