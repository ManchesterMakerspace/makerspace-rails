class Braintree::TransactionSerializer < ActiveModel::Serializer
  attributes :created_at,
             :credit_card_details,
             :customer_details,
             :disputes,
             :discount_amount,
             :discounts,
             :gateway_rejection_reason,
             :status,
             :id,
             :line_items,
             :payment_instrument_type,
             :paypal_details,
             :plan_id,
             :recurring,
             :refund_ids,
             :refunded_transaction_id,
             :subscription_details,
             :subscription_id,
             :tax_amount,
             :amount,
             :invoice

  def amount
    object.amount.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.amount.to_s).frac * 100).truncate)
  end

  def discount_amount
    unless object.discount_amount.nil?
      object.discount_amount.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.discount_amount.to_s).frac * 100).truncate)
    end
  end
end