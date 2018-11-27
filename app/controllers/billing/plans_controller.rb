class Billing::PlansController < ApplicationController
    include FastQuery
    include BraintreeGateway

  def index
    plans = ::BraintreeService::Plan.get_plans(@gateway)
    unless plan_params[:types].nil?
      plans = ::BraintreeService::Plan.select_plans_for_types(plan_params[:types], plans)
    end
    return render_with_total_items(plans, { :each_serializer => Braintree::PlanSerializer, root: "plans"})
  end

  private
  def plan_params
    params.permit(:types)
  end
end