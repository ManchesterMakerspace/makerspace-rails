class BraintreeService::CreditCard < Braintree::CreditCard
  include ImportResource
  include ActiveModel::Serializers::JSON

  def self.new(gateway, args)
    super(gateway, args)
  end

end