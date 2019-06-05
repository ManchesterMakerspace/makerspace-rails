class BraintreeService::SubscriptionSerializer < ActiveModel::Serializer
  attributes  :id,
              :plan_id,
              :status,
              :amount,
              :failure_count,
              :days_past_due,
              :billing_day_of_month,
              :first_billing_date,
              :next_billing_date,
              :member_id,
              :member_name,
              :resource_class,
              :resource_id,
              :payment_method_token

  # Convert BigDecimal price to currency
  def amount
    object.price.truncate.to_s + '.' + sprintf('%02d', (object.price.frac * 100).truncate)
  end

  def member_id
    object.member && object.member.id
  end

  def member_name
    object.member && object.member.fullname
  end

  def resource_class
    object.resource && object.resource.class.name
  end

  def resource_id
    object.resource && object.resource.id
  end
end

