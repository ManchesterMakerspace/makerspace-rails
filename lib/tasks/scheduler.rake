desc "This task is called by the Heroku scheduler add-on and backs up the Mongo DB to local dump."
task :backup => :environment do
  if Rails.env.production?
    sh("mongodump -h #{ENV['MLAB_BASE_URL']} -d makerauth -u #{ENV['MLAB_USER']} -p #{ENV['MLAB_PASSWORD']} --archive=dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive")
    creds = Google::Auth::UserRefreshCredentials.new({
      client_id: ENV['GOOGLE_ID'],
      client_secret: ENV['GOOGLE_SECRET'],
      refresh_token: ENV['GOOGLE_TOKEN'],
      scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]
    })
    session = GoogleDrive.login_with_oauth(creds)
    collection = session.collection_by_title("Backups")
    collection.upload_from_file(Rails.root.join("dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive").to_s, "makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive", convert: false)
    notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
      channel: 'master_slacker',
      icon_emoji: ':ghost:'
    notifier.ping("Daily backup complete.")
  else
    sh("mongodump --db makerauth --archive=dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive")
    creds = Google::Auth::UserRefreshCredentials.new({
      client_id: ENV['GOOGLE_ID'],
      client_secret: ENV['GOOGLE_SECRET'],
      refresh_token: ENV['GOOGLE_TOKEN'],
      scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]
    })
    session = GoogleDrive.login_with_oauth(creds)
    collection = session.collection_by_title("Test Backups")
    collection.upload_from_file(Rails.root.join("dump/makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive").to_s, "makerauthBackup_#{Time.now.strftime('%m-%d-%Y')}.archive", convert: false)
  end
end

task :renewal_reminders => :environment do
  if Rails.env.production?
    notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
        channel: 'renewals',
        icon_emoji: ':ghost:'
  else
    notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
        channel: 'test_channel',
        icon_emoji: ':ghost:'
  end
  fail 'Error connecting to Slack' if !notifier

  slack_req_data  = {
    token: ENV['SLACK_ADMIN_TOKEN'],
    cursor: 0,
    presence: false
  }
  req = Net::HTTP.post_form(URI.parse('https://slack.com/api/users.list'), slack_req_data)
  SlackMember = Struct.new(:handle, :name, :email, :profile_name)
  slack_members = JSON.parse(req.body)['members'].collect do |record|
    sm = SlackMember.new(
                record['name'],
                record['real_name'],
                record['profile']['email'],
                "#{record['profile']['first_name']} #{record['profile']['last_name']}"
              )
  end

  now = Time.now.to_i * 1000
  tomorrow = (Time.now + 1.day).to_i * 1000
  contact_members = Member.expiring_members.map do |member|
    parsed = {
      name: member.fullname,
      expiry: member.prettyTime.strftime('%m/%d/%Y'),
      slack: member.slackHandle
    }
    if (!parsed[:slack])
       m = slack_members.select { |sm| sm.name == member.fullname ||
            sm.profile_name == member.fullname ||
            sm.email == member.email
      }.first
      if m
        parsed[:slack] = m.name
      end
    end
    if member.expirationTime <= tomorrow && member.expirationTime > now
      parsed[:msg] = ("Your membership expires tomorrow! \nYou can renew on our site <a href='http://manchestermakerspace.org/join_now'> by clicking here </a>.\nIf you're on subscription, no worries; we will manually update your card/fob when we get your payment. \nThank you!")
    elsif member.expirationTime <= now
      parsed[:msg] = ("Your membership expires today! \nYou can renew on our site <a href='http://manchestermakerspace.org/join_now'> by clicking here </a>.\nIf you're on subscription, no worries; we will manually update your card/fob when we get your payment. \nThank you!")
    else
      parsed[:msg] = ("Your membership expires on #{parsed[:expiry]}. \nYou can renew on our site <a href='http://manchestermakerspace.org/join_now'> by clicking here </a>.\nIf you're on subscription, no worries; we will manually update your card/fob when we get your payment. \nThank you!")
    end
    parsed
  end

  contact_members.each do |cm|
    if !cm[:slack]
      notifier.ping("#{cm[:name]} not found in Slack. Expires on #{cm[:expiry]}");
    else
      if Rails.env.production?
        notifier.ping(Slack::Notifier::Util::LinkFormatter.format(cm[:msg]), channel: "@#{cm[:slack]}")
        notifier.ping("Notification sent to #{cm[:name]}. Expires on #{cm[:expiry]}");
      end
    end
  end
  notifier.ping("Renewal reminders complete. Current active members: #{Member.active_members.size}")
end
