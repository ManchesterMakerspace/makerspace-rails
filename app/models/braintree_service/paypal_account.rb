class BraintreeService::PaypalAccount < Braintree::PayPalAccount
  include ActiveModel::Serializers::JSON

  def self.new(gateway, args)
    super(gateway, args)
  end
end