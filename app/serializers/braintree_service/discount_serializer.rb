class BraintreeService::DiscountSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :amount

  def amount
    object.amount.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.amount.to_s).frac * 100).truncate)
  end
end