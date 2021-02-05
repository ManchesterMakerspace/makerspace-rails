class Admin::Billing::PlansController < Admin::BillingController
  def index
    plans = ::BraintreeService::Plan.get_plans(@gateway)
    unless plan_params[:types].nil?
      plans = ::BraintreeService::Plan.select_plans_for_types(plan_params[:types], plans)
    end
    return render_with_total_items(plans, { :each_serializer => BraintreeService::PlanSerializer, adapter: :attributes })
  end

  def discounts
    discounts = ::BraintreeService::Discount.get_discounts(@gateway)
    unless plan_params[:types].nil?
      discounts = ::BraintreeService::Discount.select_discounts_for_types(plan_params[:types], discounts)
    end
    return render_with_total_items(discounts, { :each_serializer => BraintreeService::DiscountSerializer, adapter: :attributes })
  end

  private
  def plan_params
    params.permit(types: [])
  end
end