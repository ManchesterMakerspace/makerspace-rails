module SlackNotifier
  extend ActiveSupport::Concern

  included do
    before_action :slack_connect
  end

  def slack_connect
    @messages = []
    if Rails.env.production?
      @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
        channel: 'members_relations',
        icon_emoji: ':ghost:'
    else
      @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
        channel: 'test_channel',
        icon_emoji: ':ghost:'
    end
  end
end