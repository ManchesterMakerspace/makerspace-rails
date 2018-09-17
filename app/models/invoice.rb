class Invoice
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  # Types of invoices that can be generated
  OPTION_TYPES = [:membership, :rentals].freeze
  PAYMENT_TYPES = [:cash, :paypal, :credit_card, :other].freeze
  InvoiceOption = Struct.new(:id, :description, :amount)

  DEFAULT_PAYMENT_OPTIONS = {
    membership: [{
      id: "one-month-membership",
      description:  "One month, non-recurring membership",
      amount: 80.00,
    }]
  }.freeze

  field :description, type: String
  field :notes, type: String
  field :contact, type: String
  field :created_at, type: Time, default: Time.now
  field :settled_at, type: Time
  field :due_date, type: Time
  field :payment_type, type: String
  field :amount, type: Float
  field :operation_string, type: String
  field :resource_id, type: String

  validates :payment_type, inclusion: { in: PAYMENT_TYPES }, allow_nil: true
  validates_numericality_of :amount, greater_than: 0

  belongs_to :member, optional: true

  def settled
    !!self.settled_at
  end

  def settled=(value)
    self.settled_at ||= Time.now if value
  end

  def past_due
    self.due_date < Time.now
  end

  def self.get_default_payment_options(types)
    Invoice::DEFAULT_PAYMENT_OPTIONS.fetch_values(*types).flatten.map { |option| Invoice::InvoiceOption.new(*option.values_at(*Invoice::InvoiceOption.members)) }
  end
end