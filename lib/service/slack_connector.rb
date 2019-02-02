module Service
  module SlackConnector
    def connect
      Slack::Web::Client.new(token: ENV['SLACK_ADMIN_TOKEN'])
    end

    def format_slack_messages(messages)
      msg_string = messages.join(" \n ");
    end

    def send_slack_messages(messages)
      if !messages.empty?
        channel = Rails.env.production? && braintree_production? == :production ? 'members_relations' : 'test_channel'
        @client.chat_postMessage(
          channel: channel,
          text: format_slack_messages(messages),
          as_user: false,
          username: 'Management Bot',
          icon_emoji: ':ghost:'
        )
      end
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