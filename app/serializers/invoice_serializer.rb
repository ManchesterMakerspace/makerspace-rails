class InvoiceSerializer < ApplicationSerializer
  attributes :id, :description, :notes, :contact, :settled, :created_at, :due_date, :past_due, :amount, :member_id
  def member_id
    object.member.id
  end

  # def amount
  #   object.amount.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.amount.to_s).frac * 100).truncate)
  # end
end