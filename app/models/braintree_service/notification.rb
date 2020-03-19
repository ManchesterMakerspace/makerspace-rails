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
    elsif transaction_notifications.include?(notification.kind)
      process_transaction(notification)
    end
  end

  protected
  def self.as_json(notification)
    JSON.generate(get_details_for_notification(notification))
  end

  def self.get_details_for_notification(notification)
    if subscription_notifications.include?(notification.kind)
      if notification.subscription.nil?
        send_slack_message("Received malformed subscription notification. Do not know how to process.")
        return
      end

      resource_class, resource_id = ::BraintreeService::Subscription.read_id(notification.subscription.id)
      
      {
        subscription_id: notification.subscription.id,
        transaction_id: notification.subscription.transactions.first.id,
        resource_class: resource_class,
        resource_id: resource_id
      }
    elsif dispute_notifications.include?(notification.kind)
      if notification.dispute.nil?
        send_slack_message("Received malformed dispute notification. Do not know how to process.")
        return
      end

      {
        dispute_status: notification.dispute.status,
        reason: notification.dispute.reason,
        transaction_id: notification.dispute.transaction.id,

      }
    elsif transaction_notifications.include?(notification.kind)
      if notification.transaction.nil?
        send_slack_message("Received malformed transaction notification. Do not know how to process.")
        return
      end

      {
        transaction_id: notification.transaction.id,
        status: notification.transaction.status
      }
    else
      send_slack_message("Received unknown notification #{notification.kind}")
      nil
    end
  end

  def self.process_subscription(notification)
    resource_class, resource_id = ::BraintreeService::Subscription.read_id(notification.subscription.id)
    last_transaction = notification.subscription.transactions.first

    invoice = Invoice.active_invoice_for_resource(resource_id)
    related_resource = Invoice::OPERATION_RESOURCES[resource_class].find(resource_id);

    if invoice.nil?
      identifier = related_resource.nil? ? "#{resource_class} ID #{resource_id}" : related_resource.fullname

      if !related_resource.nil? && 
         (
          prior_sub_notification_for_resource(related_resource).nil? || prior_sub_notification_for_resource(related_resource).empty?
         )
        
        send_slack_message("Received subscription notification for #{identifier}. No active invoice found; skipping processing. If member just signed up, no further action required.", ::Service::SlackConnector.treasurer_channel)
        return
      else
        send_slack_message("Unable to process subscription notification. No active invoice found for #{identifier}.")
        return
      end
    elsif !!invoice.locked
      send_slack_message("Received subscription notification for in-process invoice #{invoice.id}. Skipping processing", ::Service::SlackConnector.treasurer_channel)
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
    dupe_invoice = Invoice.find_by(transaction_id: last_transaction.id, :id.ne => invoice.id)
    if dupe_invoice.nil?
      self.process_success(invoice, last_transaction)
    else
      send_slack_message("Received duplicate notification regarding #{invoice.name} for #{invoice.member.fullname}. TID: #{last_transaction.id}", ::Service::SlackConnector.treasurer_channel)
    end
  end

  def self.process_subscription_charge_failure(invoice, last_transaction)
    slack_member = SlackUser.find_by(member_id: invoice.member.id)
    member_notified = slack_member ? "The member has been notified via Slack as well." : "Unable to notify member via Slack. Reach out to member to resolve."
    send_slack_message("Your recurring payment for #{invoice.name} was unsuccessful. Error status: #{last_transaction.status}. Please <#{Rails.configuration.action_mailer.default_url_options[:host]}/#{invoice.member.id}/settings|review your payment settings> or contact an administrator for assistance.", slack_member.slack_id) unless slack_member.nil?
    send_slack_message("Recurring payment from #{invoice.member.fullname} failed with status: #{last_transaction.status}. #{member_notified}")
    BillingMailer.failed_payment(processed_invoice.member.email, processed_invoice.id, last_transaction.status)
  end

  def self.process_subscription_cancellation(invoice)
    if !!invoice.locked
      send_slack_message("Received subscription cancelation notification for in-process invoice #{invoice.id}. Skipping processing", ::Service::SlackConnector.treasurer_channel)
      return
    end
    Invoice.process_cancellation(invoice.subscription_id)
  end

  def self.process_dispute(notification)
    disputed_transaction = notification.dispute.transaction

    associated_invoice = Invoice.find_by(transaction_id: disputed_transaction.id)
    if associated_invoice.nil?
      send_slack_message("Dispute received for unknown transaction ID #{disputed_transaction.id}. Cannot find related invoice.")
      return
    end

    send_slack_message("Received dispute from #{associated_invoice.member.fullname} for #{associated_invoice.name} which was paid #{associated_invoice.settled_at}.
    Braintree transaction ID #{disputed_transaction.id} |  <#{Rails.configuration.action_mailer.default_url_options[:host]}/billing/transactions/#{associated_invoice.transaction_id}|Disputed Invoice>")
    if notification.kind === ::Braintree::WebhookNotification::Kind::DisputeOpened
      associated_invoice.set_dispute_requested
      BillingMailer.dispute_requested(associated_invoice.member.email, associated_invoice.id)
    else
      associated_invoice.set_disputed
      if notification.kind === ::Braintree::WebhookNotification::Kind::DisputeWon 
        BillingMailer.dispute_won(associated_invoice.member.email, associated_invoice.id)
      elsif notification.kind === ::Braintree::WebhookNotification::Kind::DisputeLost
        BillingMailer.dispute_lost(associated_invoice.member.email, associated_invoice.id)
      end
    end
  end

  def self.process_transaction(notification)
    last_transaction = notification.transaction
    processed_invoice = Invoice.find_by(transaction_id: last_transaction.id)

    if processed_invoice.nil?
      send_slack_message("Unable to process transaction notification. No invoice found matching transaction ID #{last_transaction.id}.")
      return
    end

    slack_member = SlackUser.find_by(member_id: processed_invoice.member.id)

    if notification.kind === Braintree::WebhookNotification::Kind::TransactionSettled
      if (processed_invoice.settled)
        send_slack_message("Pending transaction from #{processed_invoice.member.fullname} successful. No further action needed", ::Service::SlackConnector.treasurer_channel)
      else
        self.process_success(processed_invoice, last_transaction)
      end
    elsif notification.kind === Braintree::WebhookNotification::Kind::TransactionSettlementDeclined
      processed_invoice.reverse_settlement
      member_notified = slack_member ? "The member has been notified via Slack as well." : "Unable to notify member via Slack. Reach out to member to resolve."
      send_slack_message("Your payment for #{processed_invoice.name} was unsuccessful. Error status: #{last_transaction.status}. Please <#{Rails.configuration.action_mailer.default_url_options[:host]}/#{processed_invoice.member.id}/settings|review your payment settings> or contact an administrator for assistance.", slack_member.slack_id) unless slack_member.nil?
      send_slack_message("Recent transaction from #{processed_invoice.member.fullname} for #{processed_invoice.name} failed with status: #{last_transaction.status}. #{member_notified}")
      BillingMailer.failed_payment(processed_invoice.member.email, processed_invoice.id, last_transaction.status)
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

  def self.transaction_notifications
    [
      Braintree::WebhookNotification::Kind::TransactionSettlementDeclined,
      Braintree::WebhookNotification::Kind::TransactionSettled
    ]
  end

  def self.process_success(invoice, transaction)
    send_slack_message("#{invoice.subscription_id ? "Recurring" : "One-time"} payment from #{invoice.member.fullname} successful. Processing invoice...")
    begin
      # Don't need to pass gateway or payment method since payment has already been made
      invoice.submit_for_settlement(nil, nil, transaction.id)
    rescue ::Error::NotFound
      send_slack_message("Unable to process recurring payment. Unknown resource for invoice ID #{invoice.id}.")
      return
    rescue ::Error::UnprocessableEntity => err
      send_slack_message("Unable to process recurring payment for invoice ID #{invoice.id}. Error: #{err.message}")
      return
    end

    BillingMailer.receipt(invoice.member.email, transaction.id.as_json, invoice.id.as_json).deliver_later
  end

  def self.prior_sub_notification_for_resource(resource)
    BraintreeService::Notification.where(payload: /#{resource.id}/)
  end
end