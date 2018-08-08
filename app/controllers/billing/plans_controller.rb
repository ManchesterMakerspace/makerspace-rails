class Billing::PlansController < ApplicationController
    include FastQuery
    include BraintreeGateway

  def index
    plans = ::BraintreeService::Plan.get_plans(@gateway)
    return render_with_total_items(plans, { :each_serializer => Braintree::PlanSerializer})
  end
end