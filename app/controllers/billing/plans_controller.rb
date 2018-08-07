class Billing::PlansController < ApplicationController
  include BraintreeGateway

  def index
    plans = ::BraintreeService::Plan.get_plans(@gateway)
    render json: plans, each_serializer: Braintree::PlanSerializer and return
  end
end