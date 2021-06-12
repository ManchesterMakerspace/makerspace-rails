class BraintreeService::Transaction < Braintree::Transaction
  include ImportResource
  extend Service::SlackConnector
  include ActiveModel::Serializers::JSON

  attr_writer :invoice

  def self.new(gateway, args)
    super(gateway, args)
  end

  def self.refund(gateway, transaction_id)
    result = gateway.transaction.refund(transaction_id)
    raise ::Error::Braintree::Result.new(result) unless result.success?
    transaction = normalize(gateway, result.transaction)
    invoice = transaction.invoice
    if invoice.nil?
      enque_message("Err: Refunded transaction #{transaction.id} without related invoice. Investigation required")
    else
      invoice.update!({ refunded: true })
      BillingMailer.refund(invoice.member.email, transaction_id, invoice.id.to_s).deliver_later
      enque_message("#{invoice.member.fullname}'s refund of #{invoice.amount} for #{invoice.name} from #{invoice.settled_at} completed.")
    end

    transaction
  end

  def self.get_transactions(gateway, search_query = nil)
    transactions = gateway.transaction.search { |search| search_query && search_query.call(search) }
    transactions.map do |transaction|
      normalize(gateway, transaction)
    end
  end

  def self.get_transaction(gateway, id)
    transaction = gateway.transaction.find(id)
    normalize(gateway, transaction)
  end

  # TODO: This should be split between subscription and transaction models
  def self.submit_invoice_for_settlement(gateway, invoice)
     if invoice.plan_id
      subscription = ::BraintreeService::Subscription.create(gateway, invoice)
      transaction = subscription.transactions.first
      update_hash = { subscription_id: subscription.id }
      # Required due to renewal reminders service
      if Invoice::OPERATION_RESOURCES[invoice.resource_class].method_defined? :subscription
        update_hash[:subscription] = true
      end
      invoice.resource.update!(update_hash)
      BillingMailer.new_subscription(invoice.member.email, subscription.id, invoice.id.to_s).deliver_later
    else
      result = gateway.transaction.sale(
        amount: invoice.amount,
        payment_method_token: invoice.payment_method_id,
        line_items: [{
          kind: "debit",
          name: invoice.name,
          quantity: 1,
          total_amount: invoice.amount,
          unit_amount: invoice.amount
        }],
        options: {
          submit_for_settlement: true
        },
      )
      raise ::Error::Braintree::Result.new(result) unless result.success?
      transaction = result.transaction
    end

    invoice.update!({
      subscription_id: subscription ? subscription.id : nil,
      transaction_id: transaction.id,
    })

    BillingMailer.receipt(invoice.member.email, transaction.id, invoice.id.to_s).deliver_later
    unless subscription.nil?
      enque_message("New subscription from #{invoice.member.fullname} received for #{invoice.name}")
    end
    enque_message("Payment from #{invoice.member.fullname} of $#{invoice.amount} received for #{invoice.name}")
    normalize(gateway, transaction)
  end

  def payment_method
    payment_method_type = self.payment_instrument_type
    payment_method_type == "credit_card" ? self.credit_card_details : self.paypal_details unless payment_method_type.nil?
  end

  def pretty_status
    status.titleize
  end

  def invoice 
    Invoice.find_by({ transaction_id: id })
  end

  private
  def self.normalize(gateway, transaction)
    norm_transaction = self.new(gateway, instance_to_hash(transaction))

    # Search by refunded ID if it's a refund transaction
    transaction_id = norm_transaction.refunded_transaction_id || norm_transaction.id
    norm_transaction
  end
end