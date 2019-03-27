class BraintreeService::Transaction < Braintree::Transaction
  include ImportResource
  include ActiveModel::Serializers::JSON

  def self.new(gateway, args)
    super(gateway, args)
  end

  def self.refund(gateway, transaction_id)
    gateway.transaction.refund(id)
  end

  def self.get_transactions(gateway, search_query)
    transactions = gateway.transaction.search do |search|
      if search_query.kind_of? Hash
        search.customer_id.is search_query[:customer_id] unless search_query[:customer_id].nil?
        search.status.is Braintree::Transaction::Status::Settled if search_query[:paid]
      end
    end
    transactions.map do |transaction|
      normalize_transaction(gateway, transaction)
    end
  end

  def self.get_transaction(gateway, id)
    transaction = gateway.transaction.find(id)
    normalize(transaction)
  end

  def self.submit_invoice_for_settlement(gateway, invoice)
     if invoice.plan_id
      result = ::BraintreeService::Subscription.create(gateway, invoice)
      raise ::Error::Braintree:Result.new(result) unless result.success?
      self.update({ subscription_id: subscription.id, transaction_id: subscription.transactions.first.id })
      transaction = result.subscription.transactions.first
    else
      result = @gateway.transaction.sale(
        amount: invoice.amount,
        payment_method_token: invoice.payment_method_id,
        line_items: [{
          kind: "debit",
          name: invoice.description,
          quantity: 1,
          total_amount: invoice.amount,
          unit_amount: invoice.amount
        }],
        options: {
          submit_for_settlement: true
        },
      )
      raise ::Error::Braintree:Result.new(result) unless result.success?
      transaction = result.transaction
      self.update!({ tramsaction_id: transaction.id })
      transaction
    end

    normalize(transaction)
  end

  private
  def self.normalize(gateway, transaction)
    self.new(gateway, instance_to_hash(transaction))
  end
end