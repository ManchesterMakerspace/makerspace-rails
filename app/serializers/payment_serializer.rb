class PaymentSerializer < ActiveModel::Serializer
  attributes :amount, :firstname, :lastname, :payer_email, :payment_date, :product
  belongs_to :member
end
