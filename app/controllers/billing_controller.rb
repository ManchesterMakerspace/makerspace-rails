class BillingController < AuthenticationController
  before_action :verify_billing_permission

  private
  def verify_billing_permission
    current_member.is_allowed?(:billing)
  end
end