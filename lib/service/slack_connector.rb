module Service
  module SlackConnector

    def send_slack_messages(messages, channel = ::Service::SlackConnector.members_relations_channel)
      ::Service::SlackConnector.send_slack_messages(messages, channel)
    end

    def self.send_slack_messages(messages, channel = ::Service::SlackConnector.members_relations_channel)
      send_slack_message(format_slack_messages(messages, channel), channel) unless messages.nil? || messages.empty?
    end

    def send_slack_message(message, channel = ::Service::SlackConnector.members_relations_channel)
      ::Service::SlackConnector.send_slack_message(message, channel)
    end

    def self.send_slack_message(message, channel = ::Service::SlackConnector.members_relations_channel)
      client.chat_postMessage(
        channel: safe_channel(channel),
        text: message,
        as_user: false,
        username: 'Management Bot',
        icon_emoji: ':ghost:'
      )
    end

    def invite_to_slack()
      ::Service::SlackConnector.invite_to_slack()
    end

    def self.invite_to_slack()
      if ::Util.is_prod?
        client.users_admin_invite(
          email: self.email,
          first_name: self.firstname,
          last_name: self.lastname
        )
      end
    end

    def self.safe_channel(channel)
      ::Util.is_prod? ? channel : "test_channel"
    end

    def self.treasurer_channel
      "treasurer"
    end

    def self.members_relations_channel
      "members_relations"
    end

    def self.logs_channel
      "interface-logs"
    end

    private
    def self.client
      Slack::Web::Client.new(token: ENV['SLACK_ADMIN_TOKEN'])
    end

    def self.format_slack_messages(messages, channel)
      messages = messages.map { |m| "#{channel}| #{m}" } unless ::Util.is_prod?
      msg_string = messages.join(" \n ");
    end
  end
end