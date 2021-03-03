module BillingGate
  extend ActiveSupport::Concern

  included do
    before_action :verify_billing_permission
  end

  def verify_billing_permission
    raise Error::Forbidden.new unless current_member.is_allowed?(
      DefaultPermission::WHITELISTS[:billing])
  end
end