class InvoiceOption
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  ## Transaction Information
  # User friendly name for invoice displayed on receipt
  field :name, type: String
  # Any details about the invoice. Also shown on receipt
  field :description, type: String
  field :amount, type: Float
  # How many operations to perform (eg, num of months renewed)
  field :quantity, type: Integer
  # What does this do to Resource. One of Invoice::OPERATION_FUNCTIONS
  field :operation, type: String, default: "renew="
  # Class name of resource, one of OPERATION_RESOURCES
  field :resource_class, type: String
  # ID of billing plan to/is subscribe(d) to.  May reference a DEFAULT_INVOICE
  field :plan_id, type: String
  # ID of SSO discount that applies to this option
  field :discount_id, type: String

  field :disabled, type: Boolean, default: false

  validates :resource_class, inclusion: { in: Invoice::OPERATION_RESOURCES.keys }, allow_nil: false
  validates :operation, inclusion: { in: Invoice::OPERATION_FUNCTIONS }, allow_nil: false
  validates_numericality_of :amount, greater_than: 0
  validates_numericality_of :quantity, greater_than: 0
  validates_uniqueness_of :plan_id, unless: -> { plan_id.nil? }

  def build_invoice(member_id, due_date, resource_id, discount = nil)
    amount = self.amount
    amount = amount - discount.amount unless discount.nil?
    invoice_args = {
      name: self.name,
      description: self.description,
      due_date: due_date,
      amount: amount,
      member_id: member_id,
      resource_id: resource_id,
      resource_class: self.resource_class,
      quantity: self.quantity,
      discount_id: discount ? discount.id : nil,
      plan_id: self.plan_id,
      operation: self.operation,
    }
    Invoice.create!(invoice_args)
  end
end