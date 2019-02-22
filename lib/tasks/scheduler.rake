desc "This task is called by the Heroku scheduler add-on and backs up the Mongo DB to local dump."
task :backup => :environment do
  sh("mongodump --uri #{ENV['MLAB_URI']} --archive=dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive")
  creds = Google::Auth::UserRefreshCredentials.new({
    client_id: ENV['GOOGLE_ID'],
    client_secret: ENV['GOOGLE_SECRET'],
    refresh_token: ENV['GOOGLE_TOKEN'],
    scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]
  })
  session = GoogleDrive.login_with_oauth(creds)

  if Rails.env.production?
    collection = session.collection_by_title("Backups")
    collection.upload_from_file(Rails.root.join("dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive").to_s, "makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive", convert: false)
    notifier = Slack::Web::Client.new(token: ENV['SLACK_ADMIN_TOKEN'])
    notifier.chat_postMessage(
        channel: 'master_slacker',
        text: 'Daily backup complete.',
        as_user: false,
        username: 'Management Bot',
        icon_emoji: ':ghost:'
      )
  else
    collection = session.collection_by_title("Test Backups")
    collection.upload_from_file(Rails.root.join("dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive").to_s, "makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive", convert: false)
  end
end

