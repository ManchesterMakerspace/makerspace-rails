class BraintreeService::PaypalAccount < Braintree::PayPalAccount
  include ImportResource
  include ActiveModel::Serializers::JSON
end