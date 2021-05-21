class InvoiceOptionSerializer < ApplicationSerializer
  attributes :id,
             :name,
             :description,
             :amount,
             :plan_id,
             :quantity,
             :resource_class,
             :disabled,
             :discount_id,
             :operation,
             :is_promotion,
             :promotion_end_date

  def amount
    object.amount.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.amount.to_s).frac * 100).truncate)
  end

  def is_promotion
    !object.promotion_end_date.nil?
  end

  def disabled 
    object.disabled || (!!object.promotion_end_date && object.promotion_end_date < DateTime.now)
  end
end