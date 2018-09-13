class InvoiceSerializer < ActiveModel::Serializer
  attributes :description, :notes, :contact, :items, :settled, :created_at, :due_date, :past_due, :amount
  belongs_to :member
end