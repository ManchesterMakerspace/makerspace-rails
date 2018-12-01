class Admin::Billing::SubscriptionsController < ApplicationController
    include FastQuery
    include BraintreeGateway

  def index
    subs = ::BraintreeService::Subscription.get_subscriptions(@gateway)
    return render_with_total_items(subs, { :each_serializer => Braintree::SubscriptionSerializer})
  end

  def show
    subscription = ::BraintreeService::Subscription.create(@gateway, subscription_params[:id])
    render json: subscription, serializer: Braintree::SubscriptionSerializer and return
  end

  def update
    # 2 different types of updates (payment method or plan)
    result = ::BraintreeService::Subscription.update(@gateway, subscription_params)
    if result.success?
      render json: result.subscription, serializer: Braintree::SubscriptionSerializer and return
    else
      render json: { error: result.errors.map { |e| e.message } }, status: 500 and return
    end
  end

  def destroy
    result = ::BraintreeService::Subscription.cancel(@gateway, subscription_params[:id])
    if result.success?
      if subscription_resource.remove_subscription()
        render json: {}, status: 204 and return
      else
        render json: { error: subscription_resource.errors.full_messages.join(". ") }, status: 500 and return
      end
    else
      render json: { error: result.errors.map { |e| e.message } }, status: 500 and return
    end
  end

  private
  def subscription_params
    params.require(:subscription).permit(:id, :payment_method_token, :plan_id)
  end
end