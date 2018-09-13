class Invoice
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  field :description, type: String
  field :contact, type: String
  field :items, type: Array, default: []
  field :settled, type: Boolean, default:, false
  field :created_at, type: Time, default: Time.now
  field :settled_at, type: Time
  field :amount, type: Float
  field :payment_type, type: String

  validates :description, presence: true
  validates :contact, presence: true
  validates_inclusion_of :payment_type, in: [:cash, :paypal, :credit_card, :other]
  
  belongs_to :member, optional: true
end