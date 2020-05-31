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
             :is_promotion

  def amount
    object.amount.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.amount.to_s).frac * 100).truncate)
  end
end