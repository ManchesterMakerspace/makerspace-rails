module Service
  module SlackConnector
    def enque_message(
        message, 
        channel = ::Service::SlackConnector.members_relations_channel,
        uniquifier = ::Service::SlackConnector.request_caller_id(caller_locations(1,1)[0].label)
      )
      ::Service::SlackConnector.enque_message(message, channel, uniquifier)
    end

    def self.enque_message(
        message, 
        channel = members_relations_channel,
        uniquifier = request_caller_id(caller_locations(1,1)[0].label)
      )
      Redis.current.set(uniquifier, {
        message: message,
        channel: channel,
        timestamp: Time.now
      }.to_json)
    end

    def get_enqueued_messages(uniquifier)
      ::Service::SlackConnector.get_enqueued_messages(uniquifier)
    end

    def self.get_enqueued_messages(uniquifier)
      related_keys = Redis.current.keys(uniquifier)
      related_keys.reduce({}) { |msg_hash, key| msg_hash.merge({ key => Redis.current.get(key) }) }
    end

    def send_slack_messages(messages, channel = ::Service::SlackConnector.members_relations_channel)
      ::Service::SlackConnector.send_slack_messages(messages, channel)
    end

    def self.send_slack_messages(messages, channel = ::Service::SlackConnector.members_relations_channel)
      send_slack_message(format_slack_messages(messages, channel), channel) unless messages.nil? || messages.empty? || Rails.env.test?
    end

    def send_slack_message(message, channel = ::Service::SlackConnector.members_relations_channel)
      ::Service::SlackConnector.send_slack_message(message, channel)
    end

    def self.send_slack_message(message, channel = ::Service::SlackConnector.members_relations_channel)
      return if Rails.env.test?

      send_as_msg = message.kind_of?(String)
      if send_as_msg
        client.chat_postMessage(
          channel: safe_channel(channel),
          text: message,
          as_user: false,
          username: 'Management Bot',
          icon_emoji: ':ghost:'
        )
      else 
        client.chat_postMessage(
          channel: safe_channel(channel),
          blocks: message,
          as_user: false,
          username: 'Management Bot',
          icon_emoji: ':ghost:'
        )
      end
    end

    def invite_to_slack(email, lastname, firstname)
      # Call with self since this is the instance method
      ::Service::SlackConnector.invite_to_slack(email, lastname, firstname)
    end

    def self.invite_to_slack(email, lastname, firstname)
      if ::Util.is_prod?
        client.users_admin_invite(
          email: email,
          first_name: firstname,
          last_name: lastname
        )
      end
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
    def self.safe_channel(channel)
      ::Util.is_prod? ? channel : "test_channel"
    end

    def self.client
      Slack::Web::Client.new(token: ENV['SLACK_ADMIN_TOKEN'])
    end

    def self.format_slack_messages(messages, channel)
      messages = messages.map { |m| "#{channel}| #{m}" } unless ::Util.is_prod?
      msg_string = messages.join(" \n ");
    end

    def self.request_caller_id(caller_method)
      "#{Current.request_id}.#{caller_method}"
    end
  end
end