class Payment
  include Mongoid::Document
  store_in collection: 'generals', database: 'makerspacepayments', client: 'payments'

  field :product
  field :firstname
  field :lastname
  field :amount, type: Float
  field :currency
  field :payment_date
  field :payer_email
  field :address
  field :txn_id
  field :txn_type
  field :test
end
