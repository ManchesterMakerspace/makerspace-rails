class Billing::PlansController < ApplicationController
  include BraintreeGateway
  include FastQuery::BraintreeQuery
  
  def index
    plans = ::BraintreeService::Plan.get_plans(@gateway)
    unless plan_params[:types].nil?
      plans = ::BraintreeService::Plan.select_plans_for_types(plan_params[:types], plans)
    end
    return render_with_total_items(plans, { :each_serializer => BraintreeService::PlanSerializer, adapter: :attributes })
  end

  private
  def plan_params
    params.permit(types: [])
  end
end