module Service
  module BraintreeGateway
    def connect_gateway
      Braintree::Gateway.new(
        :environment => ENV["BT_ENV"].to_sym,
        :merchant_id => ENV["BT_MERCHANT_ID"],
        :public_key => ENV["BT_PUBLIC_KEY"],
        :private_key => ENV['BT_PRIVATE_KEY'],
      )
    end
  end
end