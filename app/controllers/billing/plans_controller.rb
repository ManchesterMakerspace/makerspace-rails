class Billing::PlansController < BillingController
    include FastQuery
    include BraintreeGateway

  def index
    plans = ::BraintreeService::Plan.get_plans(@gateway)
    unless plan_params[:types].nil?
      plans = ::BraintreeService::Plan.select_plans_for_types(plan_params[:types], plans)
    end
    return render_with_total_items(plans, { :each_serializer => Braintree::PlanSerializer, root: "plans" })
  end

  def discounts
    discounts = ::BraintreeService::Discount.get_discounts(@gateway)
    return render_with_total_items(discounts, { :each_serializer => Braintree::DiscountSerializer, root: "discounts" })
  end

  private
  def plan_params
    params.permit(types: [])
  end
end