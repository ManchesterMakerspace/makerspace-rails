class Billing::SubscriptionsController < ApplicationController
    include FastQuery
    include BraintreeGateway
    before_action :verify_own_subscription, only: [:show, :update, :destroy]

  def show
    subscription = ::BraintreeService::Subscription.get_subscription(@gateway, params[:id])
    render json: subscription, serializer: Braintree::SubscriptionSerializer, root: "subscription" and return
  end

  def update
    # 2 different types of updates (payment method or plan)
    result = ::BraintreeService::Subscription.update(@gateway, subscription_params)
    raise Error::Braintree::Result.new(result) unless result.success?
    render json: subscription, serializer: Braintree::SubscriptionSerializer, root: "subscription" and return
  end

  def destroy
    result = ::BraintreeService::Subscription.cancel(@gateway, subscription_params[:id])
    raise Error::Braintree::Result.new(result) unless result.success?
    @subscription_resource.remove_subscription()
    render json: {}, status: 204 and return
  end

  private
  def subscription_params
    params.require(:subscription).permit(:id, :payment_method_token, :plan_id)
  end

  def verify_own_subscription
    subscription_id = params[:id] || subscription_params[:id]
    @subscription_resource = current_member.find_subscription_resource(subscription_id)
    if @subscription_resource.nil?
      render json: { error: "Unauthorized or not found" }, status: 404 and return
    end
  end
end