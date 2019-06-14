module Service
  module BraintreeGateway
    def self.connect_gateway
      Braintree::Gateway.new(
        :environment => ENV["BT_ENV"].to_sym,
        :merchant_id => ENV["BT_MERCHANT_ID"],
        :public_key => ENV["BT_PUBLIC_KEY"],
        :private_key => ENV['BT_PRIVATE_KEY'],
      )
    end

    def connect_gateway
      ::Service::BraintreeGateway.connect_gateway
    end
  end
end