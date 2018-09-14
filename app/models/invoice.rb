class Invoice
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  field :description, type: String
  field :notes, type: String
  field :contact, type: String
  field :items, type: Array, default: []
  field :created_at, type: Time, default: Time.now
  field :settled_at, type: Time
  field :due_date, type: Time
  field :amount, type: Float
  field :payment_type, type: String

  validates :description, presence: true
  validates :contact, presence: true
  validates :payment_type, inclusion: { in: [:cash, :paypal, :credit_card, :other] }, allow_nil: true
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
end