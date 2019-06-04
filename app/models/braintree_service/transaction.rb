class BraintreeService::Transaction < Braintree::Transaction
  include ImportResource
  extend Service::SlackConnector
  include ActiveModel::Serializers::JSON

  attr_accessor :invoice

  def self.new(gateway, args)
    super(gateway, args)
  end

  def self.refund(gateway, transaction_id)
    result = gateway.transaction.refund(transaction_id)
    raise ::Error::Braintree::Result.new(result) unless result.success?
    transaction = normalize(gateway, result.transaction)
    invoice = transaction.invoice
    unless invoice.nil?
      invoice.update!({ refunded: true })
    end

    BillingMailer.refund(invoice.member.email, transaction_id, invoice.id.to_s).deliver_later
    send_slack_message("#{invoice.member.fullname}'s refund of #{invoice.amount} for #{invoice.name} from #{invoice.settled_at} completed.")
    normalize(gateway, result.transaction)
  end

  def self.get_transactions(gateway, search_query = nil)
    transactions = gateway.transaction.search do |search|
      if search_query.kind_of? Hash
        search.customer_id.is search_query[:customer_id] unless search_query[:customer_id].nil?
        search.created_at >= search_query[:start_date] unless search_query[:start_date].nil?
        search.created_at <= search_query[:end_date] unless search_query[:end_date].nil?
      end
    end
    transactions.map do |transaction|
      normalize(gateway, transaction)
    end
  end

  def self.get_transaction(gateway, id)
    transaction = gateway.transaction.find(id)
    normalize(gateway, transaction)
  end

  def self.submit_invoice_for_settlement(gateway, invoice)
     if invoice.plan_id
      subscription = ::BraintreeService::Subscription.create(gateway, invoice)
      transaction = subscription.transactions.first
      invoice.update!({ subscription_id: subscription.id, transaction_id: transaction.id })
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
      invoice.update!({ transaction_id: transaction.id })
    end
    
    BillingMailer.receipt(invoice.member.email, transaction.id, invoice.id.to_s).deliver_later
    send_slack_message("Payment from #{invoice.member.fullname} of $#{invoice.amount} received for #{invoice.name}")
    normalize(gateway, transaction)
  end

  private
  def self.normalize(gateway, transaction)
    self.new(gateway, instance_to_hash(transaction))
    self.invoice ||= Invoice.find_by(transaction_id: self.id)
  end
end