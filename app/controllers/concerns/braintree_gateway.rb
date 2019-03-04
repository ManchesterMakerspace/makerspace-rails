module BraintreeGateway
  include Service::BraintreeGateway
  extend ActiveSupport::Concern

  included do
    before_action :init_gateway
  end

  def init_gateway
    @gateway ||= self.connect_gateway
  end
end