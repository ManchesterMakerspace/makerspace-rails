class BraintreeService::CreditCard < Braintree::CreditCard
  include ImportResource
  include ActiveModel::Serializers::JSON
end