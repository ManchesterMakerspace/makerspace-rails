module Service
  module SlackConnector
    def connect_slack
      Slack::Web::Client.new(token: ENV['SLACK_ADMIN_TOKEN'])
    end

    def format_slack_messages(messages)
      msg_string = messages.join(" \n ");
    end

    def send_slack_messages(messages)
      send_slack_message(format_slack_messages(messages)) unless messages.empty?
    end

    def send_slack_message(message)
      channel = Rails.env.production? && braintree_production? == :production ? 'members_relations' : 'test_channel'
      @client.chat_postMessage(
        channel: channel,
        text: message,
        as_user: false,
        username: 'Management Bot',
        icon_emoji: ':ghost:'
      )
    end

    def invite_to_slack(member)
      @client.users_admin_invite(
        email: member.email,
        first_name: member.firstname,
        last_name: member.lastname
      )
    end
  end
end