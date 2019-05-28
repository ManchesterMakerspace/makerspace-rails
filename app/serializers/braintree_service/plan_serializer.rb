class BraintreeService::PlanSerializer < ActiveModel::Serializer
  attributes :id,
            :name,
            :description,
            :amount,
            :billing_frequency,
            :discounts


  def amount
    object.price.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.price.to_s).frac * 100).truncate)
  end

  def discounts
    object.discounts && object.discounts.map do |discount|
      {
        id: discount.id,
        name: discount.name,
        description: discount.description,
        amount: to_amount(discount.amount),
      }
    end
  end

  def to_amount(price)
    price.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(price.to_s).frac * 100).truncate)
  end
end
