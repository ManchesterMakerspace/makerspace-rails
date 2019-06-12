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

  has_one :invoice

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

  # TODO this shouldn't be hardcoded
  def payment_method_details
    payment_attr = object.payment_instrument_type
    if payment_attr == "credit_card"
      details_hash = object.credit_card_details
      details = {
        cardType: details_hash.card_type,
        expirationMonth: details_hash.expiration_month,
        expirationYear: details_hash.expiration_year,
        expirationDate: details_hash.expiration_date,
        last4: details_hash.last_4,
        imageUrl: details_hash.image_url
      }
    elsif payment_attr == "paypal"
      details_hash = object.paypal_details
      details = {
        email: details_hash.email,
        imageUrl: details_hash.image_url
      }
    end
    details
  end

  # TODO this shouldn't be hardcoded
  def subscription_details
    {
      billingPeriodStartDate: object.subscription_details.billing_period_start_date,
      billingPeriodEndDate: object.subscription_details.billing_period_end_date,
    }
  end
end