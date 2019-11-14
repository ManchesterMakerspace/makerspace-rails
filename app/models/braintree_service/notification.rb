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
      payload: JSON.generate(notification.except("kind", "timestamp"))
    })

    if subscription_notifications.include?(notification.kind)
      self.process_subscription(notification)
    elsif dispute_notifications.include?(notification.kind)
      self.process_dispute(notification)
    end
  end

  protected
  def self.process_subscription(notification)
    if notification.subscription.nil?
      send_slack_message("Received malformed subscription notification. Do not know how to process.")
      return
    end

    resource_class, resource_id = ::BraintreeService::Subscription.read_id(notification.subscription.id)
    last_transaction = notification.subscription.transactions.last

    invoice = Invoice.active_invoice_for_resource(resource_id)
    if invoice.nil?
      send_slack_message("Unable to process recurring payment. No active invoice found for #{resource_class} ID #{resource_id}.")
      return
    end

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
    associated_invoice.set_refund_requested # TODO should dispute requested be it's own prop?
    # TODO send an email too
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