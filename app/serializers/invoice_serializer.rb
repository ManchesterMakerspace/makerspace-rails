class InvoiceSerializer < ApplicationSerializer
  attributes :id, :description, :notes, :contact, :settled, :created_at, :due_date, :past_due, :amount, :member_id
  def member_id
    object.member.id
  end
end