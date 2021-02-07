desc "This task is called by the Heroku scheduler add-on and reviews membership statuses."
task :member_review => :environment do
  should_run = Rails.env.production? ? !!Date.today.sunday? : true
  @base_url = ActionMailer::Base.default_url_options[:host]

  @management_messages = [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "Weekly Membership Review",
        "emoji": true
      }
    }
  ]

  def add_context(title, members)
    @management_messages.push({
			"type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*#{title} (#{members.size})*",
      }
		})
  end

  # Only run this task on Sundays
  if should_run
    begin
      # Query Database
      @need_orientation = Service::Analytics::Members.query_membership_not_started(Service::Analytics::Members.query_braintree_members)
      @no_purchase_members = Service::Analytics::Members.query_no_membership()
      @paypal_members = Service::Analytics::Members.query_paypal_members()
      @no_member_contract = Service::Analytics::Members.query_no_member_contract()
      @no_rental_contract = Member.where(:id.in => Service::Analytics::Rentals.query_no_rental_contract().pluck(:member_id))

      # Helpers
      def send_report(member_list, management_message, slack_lambda)
        build_management_messages(management_message, member_list)
        slack_users = SlackUser.in(member_id: member_list.map(&:id))
        slack_users.each { |slack_user| slack_lambda.call(slack_user) }
      end

      def build_management_messages(title, members)
        add_context(title, members)
        slack_activity = "NO_SLACK"

        member_messages = []

        members.each do |member| 
          slack_user = SlackUser.find_by(member_id: member)
          unless slack_user.nil?
            slack_activity = "INACTIVE"

            team_info = ::Service::SlackConnector.client.team_billableInfo({ user: slack_user.slack_id })
            is_slack_active = team_info.billable_info[slack_user.slack_id].billing_active
            if is_slack_active
              slack_activity = "ACTIVE"
            end
          end

          slack_status_msg = ""
          if slack_activity == "NO_SLACK"
            slack_status_msg = " - (No Slack account)"
          elsif slack_activity == "INACTIVE"
            slack_status_msg = " - (Inactive on Slack)"
          end

          member_messages.push("<#{@base_url}/members/#{member.id}|#{member.fullname}>#{slack_status_msg}")
        end

        section =	{
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": member_messages.join("\n")
          }
        }

        @management_messages.push(section)
      end

      def notify_member(messages, slack_user)
        return
        channel = ::Service::SlackConnector.safe_channel(slack_user.slack_id)
        ::Service::SlackConnector.send_slack_message(messages, channel)
      end

      # Construct Messages
      def notify_orientaion_message
        send_report(
          @need_orientation,
          "Members who need orientation",
          Proc.new do |slack_user| 
            notify_member(
              "Hi #{slack_user.real_name}, please come to the next open house #{ENV["OPEN_HOUSE_SCHEDULE"]} to complete your new member orientation and recieve your key to start using the Makerspace!",
              slack_user
            ) 
          end
        )
      end

      def notify_no_purchase_message
        send_report(
          @no_purchase_members,
          "People who created an account but did not purchase membership",
          Proc.new do |slack_user| 
            notify_member(
              "Hi #{slack_user.real_name}, we noticed you signed up but never purchased a membership. Is there anything we can help you with? Please come to the next open house #{ENV["OPEN_HOUSE_SCHEDULE"]} to meet the members and see the Makerspace.",
              slack_user
            ) 
          end
        )
      end

      def notify_paypal_message
        send_report(
          @paypal_members,
          "Members who are still on PayPal billing",
          Proc.new do |slack_user| 
            notify_member(
              "Hi #{slack_user.real_name}, it seems your membership is still tied to a PayPal account. Please help us finish moving memberships to our new payment provider by viewing your profile. You will not encounter any additional charges by moving your membership.",
              slack_user
            ) 
          end
        )
      end

      def notify_missing_contracts(missing_contracts, contract_type)
        send_report(
          missing_contracts,
          "Members who need to sign #{contract_type}s",
          Proc.new do |slack_user| 
            notify_member(
              "Hi #{slack_user.real_name}, we are missing a #{contract_type} from you and need this document in order to keep your membership in good standing. <#{@base_url}/members/#{slack_user.member_id}|Please login to complete the document>", 
              slack_user
            )
            ::MemberMailer.request_document(contract_type, slack_user.member_id.as_json).deliver_later
          end
        )
      end

      # Send individual users messages and construct large message for management
      notify_orientaion_message() if @need_orientation.length != 0
      notify_no_purchase_message() if @no_purchase_members.length != 0
      notify_missing_contracts(@no_member_contract, "Member Contract") if @no_member_contract.length != 0
      notify_missing_contracts(@no_rental_contract, "Rental Agreement") if @no_rental_contract.length != 0
      # TODO: Enable this when there is a self-serve transition service
      # notify_paypal_message() if @paypal_members.length != 0

      # Send management their report
      ::Service::SlackConnector.send_complex_message(@management_messages, ::Service::SlackConnector.members_relations_channel)
    rescue => e
      error = "#{e.message}\n#{e.backtrace.inspect}"
      ::Service::SlackConnector.send_slack_message(error, ::Service::SlackConnector.logs_channel)
      raise e
    end
  end
end
