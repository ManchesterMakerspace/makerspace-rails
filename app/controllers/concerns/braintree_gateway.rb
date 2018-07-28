module BraintreeGateway
  extend ActiveSupport::Concern

  included do
    before_action :init_gateway
  end

  def init_gateway
    @gateway = Braintree::Gateway.new(
      :environment => :sandbox,
      :merchant_id => ENV["BT_MERCHANT_ID"],
      :public_key => ENV["BT_PUBLIC_KEY"],
      :private_key => ENV['BT_PRIVATE_KEY'],
    )
  end
end