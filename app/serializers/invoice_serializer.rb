class InvoiceSerializer < ApplicationSerializer
  attributes :id, :description, :notes, :contact, :settled, :created_at, :due_date, :past_due, :amount
  belongs_to :member
end