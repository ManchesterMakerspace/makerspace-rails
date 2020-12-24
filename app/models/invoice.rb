class Invoice
  include Mongoid::Document
  include Mongoid::Search
  include ActiveModel::Serializers::JSON
  include Service::SlackConnector

  OPERATION_RESOURCES = {
    "member" => Member,
    "rental" => Rental,
  }.freeze
  OPERATION_FUNCTIONS = ["renew="].freeze

  ## Transaction Information
  # User friendly name for invoice displayed on receipt
  field :name, type: String
  # Any details about the invoice. Also shown on receipt
  field :description, type: String
  field :created_at, type: Time, default: Time.now
  # When payment submitted.
  field :settled_at, type: Time
  field :due_date # Intentionally don't define type. Mongoid is coercing string so TZ not being applied
  field :amount, type: Float
  field :discount_id, type: String
  field :refunded, type: Boolean, default: false
  field :refund_requested, type: Time
  field :dispute_requested, type: Time
  field :dispute_settled, type: Boolean
  field :locked, type: Boolean, default: false # Lock an invoice to prevent braintree notification race condition

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
  # ID of billing plan to/is subscribe(d) to.
  field :plan_id, type: String
  # ID of transaction used to settle invoice
  field :transaction_id, type: String

  search_in :name, member: %i[firstname lastname email]

  validates :resource_class, inclusion: { in: OPERATION_RESOURCES.keys }, allow_nil: false
  validates :operation, inclusion: { in: OPERATION_FUNCTIONS }, allow_nil: false
  validates_numericality_of :amount, greater_than: 0
  validates_numericality_of :quantity, greater_than: 0
  validates :resource_id, presence: true
  validates :due_date, presence: true
  validate :one_active_invoice_per_resource, on: :create, if: Proc.new { (resource_class != "rental") }
  validate :resource_exists

  belongs_to :member

  before_save :set_due_date
  after_create :send_rental_email, if: Proc.new { (resource_class == "rental" && subscription_id.nil?) || plan_id.nil? }

  attr_accessor :found_resource, :payment_method_id

  def lock
    self.update!({ locked: true })
  end

  def unlock
    self.update!({ locked: false })
  end

  def settled
    !!self.settled_at
  end

  def settled=(value)
    if value
      self.settled_at ||= Time.now
    else
      self.settled_at = nil
    end
  end

  def set_refund_requested
    self.refund_requested ||= Time.now
    self.save!
  end

  def set_disputed
    self.dispute_settled = true
    self.save!
  end

  def set_dispute_requested
    self.dispute_requested ||= Time.now
    self.save!
  end

  def request_refund
    set_refund_requested
    base_url = ActionMailer::Base.default_url_options[:host]
    send_slack_message("#{member.fullname} has requested a refund of #{amount} for #{name || description} from #{settled_at}. <#{base_url}/billing/transactions/#{transaction_id}|Process refund>")
    BillingMailer.refund_requested(member.email, transaction_id, id.as_json).deliver_later
  end

  def past_due
    if (self.settled || self.transaction_id)
      false
    else
      (self.due_date && self.due_date < Time.now) # Still outstanding, request after due date
    end
  end

  def submit_for_settlement(gateway=nil, payment_method_id=nil, transaction_id=nil)
    raise Error::UnprocessableEntity.new("Already paid") if settled
    raise Error::UnprocessableEntity.new("Cannot dictate transaction id when creating new transaction") if payment_method_id && transaction_id

    if payment_method_id
      self.payment_method_id = payment_method_id
      transaction = ::BraintreeService::Transaction.submit_invoice_for_settlement(gateway, self)
    end
    if (self.transaction_id.nil?)
      self.update!({ transaction_id: transaction ? transaction.id : transaction_id })
    end
    settle_invoice

    # Build recurring invoice if applicable
    unless self.plan_id.nil?
      build_next_invoice(gateway)
    end

    transaction
  end

  def reverse_settlement()
    reverse_invoice_operation()
  end

  def settle_invoice
    execute_invoice_operation
  end

  def build_next_invoice(gateway=nil)
    next_invoice = self.clone
    next_invoice.created_at = Time.now
    next_invoice.settled_at = nil
    next_invoice.refunded = false
    next_invoice.refund_requested = nil
    next_invoice.transaction_id = nil
    next_invoice.locked = false
    next_invoice.dispute_settled = false
    next_invoice.dispute_requested = nil
    next_invoice.due_date = self.due_date + self.quantity.months

    if next_invoice.subscription_id && gateway
      subscription = ::BraintreeService::Subscription.get_subscription(gateway, next_invoice.subscription_id)
      # Amount is plan amount minus discounts that are active (active being never expire or has billing cycles left)
      next_invoice.amount = subscription.price - subscription.discounts.select { |d| d.never_expires? || (d.number_of_billing_cycles || 0) > (d.quantity || 0) }.map { |d| d.amount }.inject(0, :+)
    end

    next_invoice.save!
  end

  def send_cancellation_notification
    slack_user = SlackUser.find_by(member_id: self.member_id)
    type = self.resource_class == "member" ? "membership" : "rental"
    message = "#{self.member.fullname}'s #{type} subscription#{type == "rental" ? " for #{self.resource.number}" : ""} has been canceled."
    send_slack_message(message, ::Service::SlackConnector.safe_channel(slack_user.slack_id)) unless slack_user.nil?
    send_slack_message(message, ::Service::SlackConnector.members_relations_channel)
    BillingMailer.canceled_subscription(self.member.email, self.resource_class).deliver_later
  end

  def self.process_cancellation(subscription_id, skip_notification=false)
    invoice = find_invoice_by_subscription_id(subscription_id)
    unless invoice.nil? || invoice.locked # Only send cancellation notifications if the invoice exists and isn't already being cancelled
      # Destroy invoices for this subscription that are still outstanding
      Invoice.where(subscription_id: subscription_id, settled_at: nil, transaction_id: nil).destroy
      !skip_notification && invoice.send_cancellation_notification # Can send notification after destorying because there is still `invoice` in memory
    end
  end

  def self.find_invoice_by_subscription_id(subscription_id)
    invoice = Invoice.find_by(subscription_id: subscription_id, settled_at: nil, transaction_id: nil) # Find a related invoice in order to get notification details
    invoice = Invoice.where(subscription_id: subscription_id).last if invoice.nil?
    invoice
  end

  def self.resource(class_name, id)
    Invoice::OPERATION_RESOURCES[class_name].find(id) unless Invoice::OPERATION_RESOURCES[class_name].nil? || id.nil?
  end

  def resource
    found_resource ||= self.class.resource(self.resource_class, self.resource_id)
  end

  def resource_name
    options = {
      member: "fullname",
      rental: "number"
    }
    option = options[self.resource_class.to_sym]
    self.resource.try(option.to_sym)
  end

  def generate_subscription_id
    "#{resource_class}_#{resource_id}_#{id}"
  end

  def self.active_invoice_for_resource(resource_id)
    active = self.find_by(resource_id: resource_id, settled_at: nil, transaction_id: nil)
  end

  def self.search(searchTerms, criteria = Mongoid::Criteria.new(Invoice))
    criteria.full_text_search(searchTerms)
  end

  private
  def set_due_date
    self.due_date = Time.parse(self.due_date).in_time_zone('Eastern Time (US & Canada)') if self.due_date.kind_of?(String)
  end

  def send_rental_email
    BillingMailer.new_invoice(self.member.email, self.id.as_json).deliver_later
  end

  def execute_invoice_operation
    raise ::Error::NotFound.new if resource.nil?
    operation = OPERATION_FUNCTIONS.find{ |f| f == self.operation }
    raise ::Error::UnprocessableEntity.new("Unable to process invoice. Invalid operation for invoice #{self.id}") if operation.nil?

    # Test a validation function if it exists
    if !OPERATION_RESOURCES[self.resource_class].method_defined?(:delay_invoice_operation) || !self.resource.delay_invoice_operation(operation)
      raise ::Error::UnprocessableEntity.new("Unable to process invoice. Operation failed for invoice #{self.id}") unless resource.execute_operation(operation, self)
      resource.send_renewal_slack_message()
      self.settled = true
      self.save!
    else
      send_slack_message("Delaying processing of invoice #{self.id}... Is member missing a key?")
    end
  end

  def reverse_invoice_operation
    raise ::Error::NotFound.new if resource.nil?
    operation = OPERATION_FUNCTIONS.find{ |f| f == self.operation }
    raise ::Error::UnprocessableEntity.new("Unable to reverse invoice. Invalid operation for invoice #{self.id}") if operation.nil?

    raise ::Error::UnprocessableEntity.new("Unable to reverse invoice. Operation failed for invoice #{self.id}") unless resource.reverse_operation(operation, self)
    resource.send_renewal_reversal_slack_message()
    self.settled = false
    self.save!
  end

  def one_active_invoice_per_resource
    active = self.class.active_invoice_for_resource(resource_id)
    errors.add(:base, "Active invoices already exist for this resource") unless active.nil?
  end

  def resource_exists
    errors.add(:resource, "Invalid resource") unless !!resource
  end
end