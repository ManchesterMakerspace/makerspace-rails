class Invoice
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  OPERATION_RESOURCES = [:Member, :Rental].freeze
  OPERATION_FUNCTIONS = [:renew].freeze

  # Accepted payment types
  PAYMENT_TYPES = [:cash, :paypal, :credit_card, :other].freeze

  # Types of invoices that can be generated
  OPTION_TYPES = [:membership, :rentals].freeze
  # Non subscription option
  DEFAULT_INVOICES = {
    membership: [{
      id: "one-month-membership",
      description:  "One month, non-recurring membership",
      amount: 80.00,
      quantity: 1,
      operation: :renew,
    }],
    rentals: []
  }.freeze

  ## Transaction Information
  # User friendly name for invoice displayed on receipt
  field :name, type: String
  # Any details about the invoice. Also shown on receipt
  field :description, type: String
  # Way to contact who holds invoice (eg. email address)
  field :contact, type: String
  field :created_at, type: Time, default: Time.now
  # When payment submitted.
  field :settled_at, type: Time
  # When operation was applied
  field :executed_at, type: Time
  field :due_date, type: Time
  field :payment_type, type: String
  field :amount, type: Float
  field :discounts, type: Array

  ## Admin/Operation Information
  # How many operations to perform (eg, num of months renewed)
  field :quantity, type: Integer
  # What does this do to Resource. One of OPERATION_FUNCTIONS
  field :operation, type: String, default: :renew
  # Resource (Member, Rental) id to apply operation to
  field :resource_id, type: String
  # Class name of resource, one of OPERATION_RESOURCES
  field :resource_class, type: String
  # ID of subscription generating this invoice (if any)
  field :subscription_id, type: String
  # ID of billing plan to/is subscribe(d) to.  May reference a DEFAULT_INVOICE
  field :plan_id, type: String

  validates :payment_type, inclusion: { in: PAYMENT_TYPES }, allow_nil: true
  validates :resource_class, inclusion: { in: OPERATION_RESOURCES }, allow_nil: false
  validates :operation, inclusion: { in: OPERATION_FUNCTIONS }, allow_nil: false
  validates_numericality_of :amount, greater_than: 0
  validates_numericality_of :quantity, greater_than: 0
  validates_presence_of :resource_id
  validates_presence_of :due_date

  belongs_to :member, optional: true

  before_validation :set_due_date
  before_validation :set_operation_attr

  def settled
    !!self.settled_at
  end

  def settled=(value)
    self.settled_at ||= Time.now if value
  end

  def past_due
    self.due_date && self.due_date < Time.now
  end

  def settle_invoice(transaction_result)
    determine_payment_type(transaction_result)
    self.execute_invoice_operation
    self.settled = true
    return self.save
  end

  def build_next_invoice
    next_invoice = self.clone
    next_invoice.due_date = self.due_date + self.quantity.months
    return next_invoice.save
  end

  def self.get_default_payment_options(types)
    types ||= OPTION_TYPES
    Invoice::DEFAULT_INVOICES.fetch_values(*types).flatten.map { |option| self.new(option) }
  end

  def self.find_payment_option_by_id(id)
    found_option = Invoice::DEFAULT_INVOICES.fetch_values(OPTION_TYPES).flatten.select { |option| option[:id] == id }
    self.new(found_option) unless found_option.nil?
  end

  private
  def set_due_date
    self.due_date = Time.parse(self.due_date).in_time_zone('Eastern Time (US & Canada') if self.due_date.kind_of?(String)
  end
  def set_operation_attr
    resource = Member.find_by(id: self.resource_id) if resource.nil?
    resource = Rental.find_by(id: self.resource_id) if resource.nil?
    if resource.nil?
      raise 'Resource not found'
    end
    self.resource_class = resource.class.name
  end

  def determine_payment_type(transaction_result)
    case transaction_result
    when !credit_card_details.nil?
      self.payment_type = :credit_card
    when !paypal_details.nil?
      self.payment_type = :paypal
    else
      self.payment_type = :cash
    end
  end

  def execute_invoice_operation
    resource_class = OPERATION_RESOURCES.find{ |c| c == self.resource_class}.constantize
    if resource_class
      resource = resource_class.find(self.resource_id)
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
    raise "Unable to process invoice. Invalid resource"
  end
end