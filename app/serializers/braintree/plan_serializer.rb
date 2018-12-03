class Braintree::PlanSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :amount, :billing_frequency


  def amount
    object.price.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.price.to_s).frac * 100).truncate)
  end
end
