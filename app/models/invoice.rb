class Invoice
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  # Types of invoices that can be generated
  OPTION_TYPES = [:membership, :rentals].freeze
  OPERATION_RESOURCE_PLACEHOLDER = "{resource}"
  PAYMENT_TYPES = [:cash, :paypal, :credit_card, :other].freeze

  DEFAULT_INVOICES = {
    membership: [{
      id: "one-month-membership",
      description:  "One month, non-recurring membership",
      amount: 80.00,
      operation_string: "member.renewal = 1"
    }],
    rentals: []
  }.freeze

  field :description, type: String
  field :notes, type: String
  field :contact, type: String
  field :created_at, type: Time, default: Time.now
  field :settled_at, type: Time
  field :due_date, type: Time
  field :payment_type, type: String
  field :amount, type: Float
  field :discounts, type: Array
  field :operation_string, type: String
  field :resource_id, type: String
  field :subscription_id, type: String

  validates :payment_type, inclusion: { in: PAYMENT_TYPES }, allow_nil: true
  validates_numericality_of :amount, greater_than: 0
  validates_presence_of :due_date

  belongs_to :member, optional: true

  before_validation :set_due_date

  def set_due_date
    self.due_date = Time.parse(self.due_date).in_time_zone('Eastern Time (US & Canada') if self.due_date.kind_of?(String)
  end

  def settled
    !!self.settled_at
  end

  def settled=(value)
    self.settled_at ||= Time.now if value
  end

  def past_due
    self.due_date && self.due_date < Time.now
  end

  def self.get_default_payment_options(types)
    types ||= OPTION_TYPES
    Invoice::DEFAULT_INVOICES.fetch_values(*types).flatten.map { |option| self.new(option) }
  end

  def self.find_payment_option_by_id(id)
    found_option = Invoice::DEFAULT_INVOICES.fetch_values(OPTION_TYPES).flatten.select { |option| option[:id] == id }
    self.new(found_option) unless found_option.nil?
  end
end