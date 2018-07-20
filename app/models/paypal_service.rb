module PaypalService
  def self.ipn_valid?(request)
    return PayPal::SDK::Core::API::IPN.valid?(request)
  end

  def self.api
    return PayPal::SDK::REST
  end
end
