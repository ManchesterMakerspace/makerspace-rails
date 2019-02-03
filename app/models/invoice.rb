class Invoice
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  OPERATION_RESOURCES = {
    "member" => Member,
    "rental" => Rental,
  }.freeze
  OPERATION_FUNCTIONS = ["renew="].freeze

  # Accepted payment types
  PAYMENT_TYPES = ["cash", "paypal_account", "credit_card"].freeze

  ## Transaction Information
  # User friendly name for invoice displayed on receipt
  field :name, type: String
  # Any details about the invoice. Also shown on receipt
  field :description, type: String
  field :created_at, type: Time, default: Time.now
  # When payment submitted.
  field :settled_at, type: Time
  # When operation was applied
  field :executed_at, type: Time
  field :due_date, type: Time
  field :payment_type, type: String
  field :amount, type: Float
  field :discount_id, type: String

  ## Admin/Operation Information
  # How many operations to perform (eg, num of months renewed)
  field :quantity, type: Integer, default: 1
  # What does this do to Resource. One of OPERATION_FUNCTIONS
  field :operation, type: String, default: "renew="
  field :subscription_id, type: String
  # Resource (Member, Rental) id to apply operation to
  field :resource_id, type: String
  # Class name of resource, one of OPERATION_RESOURCES
  field :resource_class, type: String
  # ID of billing plan to/is subscribe(d) to.  May reference a DEFAULT_INVOICE
  field :plan_id, type: String

  validates :resource_class, inclusion: { in: OPERATION_RESOURCES.keys }, allow_nil: false
  validates :payment_type, inclusion: { in: PAYMENT_TYPES }, allow_nil: true
  validates :operation, inclusion: { in: OPERATION_FUNCTIONS }, allow_nil: false
  validates_numericality_of :amount, greater_than: 0
  validates_numericality_of :quantity, greater_than: 0
  validates_presence_of :resource_id
  validates_presence_of :due_date
  validate :one_active_invoice_per_resource, on: :create
  validate :one_active_membership_invoice_per_member, on: :create

  belongs_to :member

  before_validation :set_due_date

  attr_accessor :found_resource

  def settled
    !!self.settled_at
  end

  def settled=(value)
    self.settled_at ||= Time.now if !!value
  end

  def past_due
    self.due_date && self.due_date < Time.now
  end

  def settle_invoice(transaction_result)
    determine_payment_type(transaction_result)
    execute_invoice_operation
    self.settled = true
    return self.save!
  end

  def build_next_invoice
    next_invoice = self.clone
    next_invoice.due_date = self.due_date + self.quantity.months
    return next_invoice.save!
  end

  def self.resource(class_name, id)
    Invoice::OPERATION_RESOURCES[class_name].find(id)
  end

  def resource
    found_resource ||= self.class.resource(self.resource_class, self.resource_id)
  end

  private
  def set_due_date
    self.due_date = Time.parse(self.due_date).in_time_zone('Eastern Time (US & Canada') if self.due_date.kind_of?(String)
  end

  def determine_payment_type(transaction_result)
    transaction_details = transaction_result.transaction || (transaction_result.subscription.transactions.last if transaction_result.subscription)
    self.payment_type = transaction_details ? transaction_details.payment_instrument_type.to_sym : :cash
    print self.payment_type
  end

  def execute_invoice_operation
    raise ::Mongoid::Errors::DocumentNotFound.new if resource.nil?
    operation = OPERATION_FUNCTIONS.find{ |f| f == self.operation }
    if operation
      if resource.execute_operation(operation, self)
        self.executed_at = Time.now
        return
      end
      raise "Unable to process invoice. Operation failed"
    end
    raise "Unable to process invoice. Invalid operation"
  end

  def one_active_invoice_per_resource
    active = self.class.where(resource_id: resource_id, settled_at: nil)
    errors.add "Active invoices already exist for this invoice" if active.size > 0
  end

  def one_active_membership_invoice_per_member
    if resource_class == OPERATION_RESOURCES[:member]
      active = self.class.where(resource_class: resource_class, settled_at: nil)
      errors.add "Active invoices already exist for this membership" if active.size > 0
    end
  end
end