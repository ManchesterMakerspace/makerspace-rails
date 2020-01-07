desc "This task is called by the Heroku scheduler add-on and reviews membership statuses."
task :member_review => :environment do
  should_run = Rails.env.production? ? !!Date.today.sunday? : true

  # Only run this task on Sundays
  if should_run
    begin
      sign_up_only = Service::Analytics::Members.query_no_expiration()
      no_member_contract = Service::Analytics::Members.query_no_member_contract()
      no_rental_contract = Member.find(Service::Analytics::Rentals.query_no_rental_contract().pluck(:member_id))
      no_fobs = Service::Analytics::Members.query_no_fobs()

      def notfiy_management(title, members)
        base_url = ActionMailer::Base.default_url_options[:host]
        messages = ["--- Member Review Notification ---", title]
        members.each { |m| messages.push("<#{base_url}/members/#{m.id}|#{m.fullname}>")}
        ::Service::SlackConnector.send_slack_messages(messages, ::Service::SlackConnector.members_relations_channel)
      end

      def notify_member(notification, slack_user)
        base_url = ActionMailer::Base.default_url_options[:host]
        channel = ::Service::SlackConnector.safe_channel(slack_user.slack_id)
        messages = [notification, "<#{base_url}/members/#{slack_user.member_id}|Please login to complete the document>"]
        ::Service::SlackConnector.send_slack_messages(messages, channel)
      end

      def notify_missing_contracts(missing_contracts, contract_type)
        notfiy_management("Members who need to sign #{contract_type}s", missing_contracts)
        slack_users = SlackUser.in(member_id: missing_contracts.map(&:id))
        slack_users.each { |slack_user| notify_member(
          "Hi #{slack_user.real_name}, our records indicate we're missing a #{contract_type} from you.", slack_user) }
      end

      notfiy_management("Members who registered but have not started membership", sign_up_only) if sign_up_only.length != 0
      notfiy_management("Members who still need keys to the space", no_fobs) if no_fobs.length != 0
      notify_missing_contracts(no_member_contract, "Member Contract") if no_member_contract.length != 0
      notify_missing_contracts(no_rental_contract, "Rental Agreement") if no_rental_contract.length != 0

    rescue => e
      error = "#{e.message}\n#{e.backtrace.inspect}"
      ::Service::SlackConnector.send_slack_message(error, ::Service::SlackConnector.logs_channel)
      raise e
    end
  end
end
