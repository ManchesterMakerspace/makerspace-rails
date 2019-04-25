class BraintreeService::Notification
  include Mongoid::Document
  include Service::SlackConnector

  store_in collection: 'braintree__notifications'

  attr_accessor :notification, :gateway

  field :kind, type: String
  field :timestamp, type: Date
  field :payload, type: String

  def self.process(gateway, notification)
    self.create({
      kind: notification.kind,
      timestamp: notification.timestamp,
      payload: notification.except("kind", "timestamp").to_json
    })

    if subscription_notifications.include(notification.kind)
      self.process_subscription(gateway, notification)
    elsif dispute_notifications.include(notification.kind)
      # TODO: send email & slack about dispute
    end
  end

  protected
  def self.process_subscription(gateway, notification)
    resource_class, resource_id = ::BraintreeService::Subscription.read_id(notification.subscription)
    last_transaction = notification.subscription.transactions.last

    invoice = active_invoice_for_resource(resource_id)
    if invoice.nil?
      send_slack_message("Unable to process recurring payment. No active invoice found for #{resource_class} ID #{resource_id}.")
      return
    end

    begin
      # Don't need to pass gateway or payment method since payment has already been made
      invoice.settle_invoice(nil, nil, last_transaction.id)
    rescue ::Error::NotFound
      send_slack_message("Unable to process recurring payment. Unknown resource for invoice ID #{invoice.id}.")
      return
    rescue ::Error::UnprocessableEntity => err
      send_slack_message("Unable to process recurring payment for invoice ID #{invoice.id}. Error: #{err}")
      return
    end

    send_slack_message("Recurring payment from #{invoice.member.fullname} successful. #{invoice.resource.get_renewal_slack_message}")
    BillingMailer.receipt(invoice.member.email, last_transaction, invoice).deliver_later
  end

  private
  def subscription_notifications
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

  def dispute_notifications
    [
      ::Braintree::WebhookNotification::Kind::DisputeLost,
      ::Braintree::WebhookNotification::Kind::DisputeOpened,
      ::Braintree::WebhookNotification::Kind::DisputeWon,
    ]
  end
end