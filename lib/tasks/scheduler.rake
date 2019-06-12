desc "This task is called by the Heroku scheduler add-on and backs up the Mongo DB to local dump."
task :backup => :environment do
  notifier = Slack::Web::Client.new(token: ENV['SLACK_ADMIN_TOKEN'])
  begin
    file_name = "makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive"
    sh("mongodump --uri #{ENV['MLAB_URI']} --archive=dump/#{file_name}")
    Service::GoogleDrive.upload_backup(file_name)

    if Rails.env.production?
      notifier.chat_postMessage(
        channel: 'interface-logs',
        text: 'Daily backup complete.',
        as_user: false,
        username: 'Management Bot',
        icon_emoji: ':ghost:'
      )
    end

  rescue => e
    if Rails.env.production?
      notifier.chat_postMessage(
        channel: 'members_relations',
        text: "Error backing up database: #{e}",
        as_user: false,
        username: 'Management Bot',
        icon_emoji: ':ghost:'
      )
    else 
      notifier.chat_postMessage(
        channel: 'test_channel',
        text: "Error backing up database: #{e}",
        as_user: false,
        username: 'Management Bot',
        icon_emoji: ':ghost:'
      )
    end
  end
end

