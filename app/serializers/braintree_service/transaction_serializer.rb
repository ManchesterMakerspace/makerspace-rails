class BraintreeService::TransactionSerializer < ActiveModel::Serializer
  attributes :created_at,
             :customer_details,
             :disputes,
             :discount_amount,
             :discounts,
             :gateway_rejection_reason,
             :status,
             :id,
             :plan_id,
             :recurring,
             :refund_ids,
             :refunded_transaction_id,
             :subscription_details,
             :subscription_id,
             :amount,
             :member_id,
             :member_name,
             :payment_method_details

  has_one :invoice, each_serializer: InvoiceSerializer

  def amount
    object.amount.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.amount.to_s).frac * 100).truncate)
  end

  def discount_amount
    unless object.discount_amount.nil?
      object.discount_amount.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.discount_amount.to_s).frac * 100).truncate)
    end
  end

  def description
    object.invoice && object.invoice.name
  end

  def member_id
    object.invoice && object.invoice.member.id
  end

  def member_name
    object.invoice && object.invoice.member.fullname
  end

  def payment_method_details
    payment_attr = object.payment_instrument_type
    if payment_attr == "credit_card"
      details = object.credit_card_details
    elsif payment_attr == "paypal"
      details = object.paypal_details
    end
    details
  end
end