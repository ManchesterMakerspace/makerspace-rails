class Billing::DiscountsController < ApplicationController
  include BraintreeGateway
  include FastQuery::BraintreeQuery
  
  def index
    discounts = ::BraintreeService::Discount.get_discounts(@gateway)
    unless discount_params[:types].nil?
      discounts = ::BraintreeService::Discount.select_discounts_for_types(discount_params[:types], discounts)
    end
    return render_with_total_items(discounts, { :each_serializer => BraintreeService::DiscountSerializer, adapter: :attributes })
  end

  private
  def discount_params
    params.permit(types: [])
  end
end