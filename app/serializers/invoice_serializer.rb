class InvoiceSerializer < ActiveModel::Serializer
  attributes :id, :description, :notes, :contact, :items, :settled, :created_at, :due_date, :past_due, :amount
  belongs_to :member

  def items
    object.invoice_items
  end
end