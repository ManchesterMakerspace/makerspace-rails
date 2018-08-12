class Braintree::SubscriptionSerializer < ActiveModel::Serializer
  attributes  :id, 
              :plan_id, 
              :status, 
              :amount, 
              :failure_count, 
              :days_past_due,
              :billing_day_of_month, 
              :first_billing_date, 
              :next_billing_date

  # Convert BigDecimal price to currency
  def amount
    object.price.truncate.to_s + '.' + sprintf('%02d', (object.price.frac * 100).truncate)
  end
end

