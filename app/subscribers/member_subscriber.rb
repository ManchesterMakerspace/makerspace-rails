module MemberSubscriber
  extend Service::GoogleDrive
  extend Service::SlackConnector
  extend Service::BraintreeGateway
  extend self

  def subscribe
    Member.subscribe(:create) do |event|
      send_slack_invite(event[:model])
      send_google_invite(event[:model])
    end

    Member.subscribe(:email_changed) do |event|
      send_slack_invite(event[:model])
      send_google_invite(event[:model])
    end

    Member.subscribe(:billing_info_changed) do |event|
      update_braintree_customer_info(event[:model])
    end

    Member.subscribe(:destroy) do |event|
      subscription_id = event[:model].subscription_id
      if subscription_id
        begin 
          ::BraintreeService::Subscription.cancel(::Service::BraintreeGateway.connect_gateway(), subscription_id)
        rescue => err
          enque_message("Error cancelling #{event[:mode].fullname}'s membership_subscription. Err: #{err}")
        end
      end

      rentals = event[:model].rentals
      if rentals.length
        rentals.map { |rental| rental.destroy }
      end
    end
  end

  private

  def send_slack_invite(member)
    begin
      invite_to_slack(member.email, member.lastname, member.firstname)
    rescue => err
      enque_message("Error inviting #{member.fullname} to Slack. Error: #{err}")
    end
  end

  def send_google_invite(member)
    begin
      invite_gdrive(member.email)
    rescue Error::Google::Upload => err
      enque_message("Error sharing Member Resources folder with #{member.fullname}. Error: #{err}")
    end
  end

  def update_braintree_customer_info(member)
    if member.customer_id
      # ID followed by hash of the attributes to update
      # https://developers.braintreepayments.com/reference/request/customer/update/ruby
      connect_gateway.customer.update(member.customer_id, first_name: member.firstname, last_name: member.lastname)
    end
  end
end
  