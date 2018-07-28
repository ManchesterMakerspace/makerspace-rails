class Braintree::PlanSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :amount, :billing_frequency

  # Convert BigDecimal price to currency
  def amount
    object.price.truncate.to_s + '.' + sprintf('%02d', (object.price.frac * 100).truncate)
  end
end
