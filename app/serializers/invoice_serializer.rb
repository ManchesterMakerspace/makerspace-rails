class InvoiceSerializer < ApplicationSerializer
  attributes :id,
             :name,
             :description,
             :contact,
             :settled,
             :past_due,
             :created_at,
             :due_date,
             :amount,
             :subscription_id,

  def member_id
    object.member && object.member.id
  end

  # def amount
  #   object.amount.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.amount.to_s).frac * 100).truncate)
  # end
end