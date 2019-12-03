class BraintreeService::Notification
  include Mongoid::Document
  extend Service::SlackConnector

  store_in collection: 'braintree__notifications'

  attr_accessor :notification

  field :kind, type: String
  field :timestamp, type: Date
  field :payload, type: String

  def self.process(notification)
    self.create({
      kind: notification.kind,
      timestamp: notification.timestamp,
      payload: as_json(notification)
    })

    if subscription_notifications.include?(notification.kind)
      process_subscription(notification)
    elsif dispute_notifications.include?(notification.kind)
      process_dispute(notification)
    end
  end

  protected
  def self.as_json(notification)
    JSON.generate(get_details_for_notification(notification))
  end

  def self.get_details_for_notification(notification)
    if subscription_notifications.include?(notification.kind)
      {
        subscription_id: notification.subscription.id,
        transaction_id: notification.subscription.transactions.first.id,
      }
    elsif dispute_notifications.include?(notification.kind)
      {
        dispute_status: notification.dispute.status,
        reason: notification.dispute.reason,
        transaction_id: notification.dispute.transaction.id,

      }
    else
      notification
    end
  end

  def self.process_subscription(notification)
    if notification.subscription.nil?
      send_slack_message("Received malformed subscription notification. Do not know how to process.")
      return
    end

    resource_class, resource_id = ::BraintreeService::Subscription.read_id(notification.subscription.id)
    last_transaction = notification.subscription.transactions.first

    invoice = Invoice.active_invoice_for_resource(resource_id)
    if invoice.nil?
      send_slack_message("Unable to process subscription notification. No active invoice found for #{resource_class} ID #{resource_id}.")
      return
    end

    if (notification.kind === ::Braintree::WebhookNotification::Kind::SubscriptionChargedSuccessfully)
      process_subscription_charge_success(invoice, last_transaction)
    elsif (notification.kind === ::Braintree::WebhookNotification::Kind::SubscriptionChargedUnsuccessfully)
      process_subscription_charge_failure(invoice, last_transaction)
    elsif (notification.kind === ::Braintree::WebhookNotification::Kind::SubscriptionCanceled)
      process_subscription_cancellation(invoice)
    else
      send_slack_message("Received the following notification from Braintree regarding #{invoice.member.fullname}'s subscription':
Type: #{notification.kind}.
Payload: #{notification.as_json}.
No automated actions have been taken at this time.")
    end
  end

  def self.process_subscription_charge_success(invoice, last_transaction)
    dupe_invoice = Invoice.find_by(transaction_id: last_transaction.id)
    if dupe_invoice.nil?
      begin
        # Don't need to pass gateway or payment method since payment has already been made
        invoice.submit_for_settlement(nil, nil, last_transaction.id)
      rescue ::Error::NotFound
        send_slack_message("Unable to process recurring payment. Unknown resource for invoice ID #{invoice.id}.")
        return
      rescue ::Error::UnprocessableEntity => err
        send_slack_message("Unable to process recurring payment for invoice ID #{invoice.id}. Error: #{err.message}")
        return
      end

      send_slack_message("Recurring payment from #{invoice.member.fullname} successful. #{invoice.resource.get_renewal_slack_message}")

      BillingMailer.receipt(invoice.member.email, last_transaction.id.as_json, invoice.id.as_json).deliver_later
    else
      send_slack_message("Received duplicate notification regarding #{invoice.name} for #{invoice.member.fullname}. TID: #{last_transaction.id}", ::Service::SlackConnector.treasurer_channel)
    end
  end

  def self.process_subscription_charge_failure(invoice, last_transaction)
    slack_member = SlackUser.find_by(member_id: invoice.member.id)
    member_notified = slack_member ? "The member has been notified via Slack as well." : "Unable to notify member via Slack. Reach out to member to resolve."
    send_slack_message("Your recurring payment for #{invoice.name} was unsuccessful. Please <#{Rails.configuration.action_mailer.default_url_options[:host]}/#{invoice.member.id}/settings|review your payment settings> or contact an administrator for assistance.", slack_member.slack_id) unless slack_member.nil?
    send_slack_message("Recurring payment from #{invoice.member.fullname} failed with status: #{last_transaction.status}. #{member_notified}")
  end
  
  def self.process_subscription_cancellation(invoice)
    Invoice.process_cancellation(invoice.subscription_id)
  end

  def self.process_dispute(notification)
    disputed_transaction = notification.dispute.transaction

    if disputed_transaction.nil?
      send_slack_message("Received malformed dispute notification. Do not know how to process.")
      return
    end

    associated_invoice = Invoice.find_by(transaction_id: disputed_transaction.id)
    if associated_invoice.nil?
      send_slack_message("Dispute received for unknown transaction ID #{disputed_transaction.id}. Cannot find related invoice.")
      return
    end

    send_slack_message("Received dispute from #{associated_invoice.member.fullname} for #{associated_invoice.name} which was paid #{associated_invoice.settled_at}.
    Braintree transaction ID #{disputed_transaction.id} |  <#{Rails.configuration.action_mailer.default_url_options[:host]}/billing/transactions/#{associated_invoice.transaction_id}|Disputed Invoice>")
    if notification.kind === ::Braintree::WebhookNotification::Kind::DisputeOpened
      associated_invoice.set_dispute_requested
    else
      associated_invoice.set_disputed
    end
  end

  private
  def self.subscription_notifications
    [
      ::Braintree::WebhookNotification::Kind::SubscriptionCanceled,
      ::Braintree::WebhookNotification::Kind::SubscriptionChargedSuccessfully,
      ::Braintree::WebhookNotification::Kind::SubscriptionChargedUnsuccessfully,
      ::Braintree::WebhookNotification::Kind::SubscriptionExpired,
      ::Braintree::WebhookNotification::Kind::SubscriptionTrialEnded,
      ::Braintree::WebhookNotification::Kind::SubscriptionWentActive,
      ::Braintree::WebhookNotification::Kind::SubscriptionWentPastDue,
    ]
  end

  def self.dispute_notifications
    [
      ::Braintree::WebhookNotification::Kind::DisputeLost,
      ::Braintree::WebhookNotification::Kind::DisputeOpened,
      ::Braintree::WebhookNotification::Kind::DisputeWon,
    ]
  end
end