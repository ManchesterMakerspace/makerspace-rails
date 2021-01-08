class Billing::SubscriptionsController < BillingController
    before_action :verify_customer, :verify_own_subscription

  def show
    subscription = ::BraintreeService::Subscription.get_subscription(@gateway, params[:id])
    render json: subscription, serializer: BraintreeService::SubscriptionSerializer, adapter: :attributes and return
  end

  def update
    subscription_update = {
      id: params[:id],
      payment_method_token: subscription_params[:payment_method_token]
    }
    subscription = ::BraintreeService::Subscription.update(@gateway, subscription_update)
    render json: subscription, serializer: BraintreeService::SubscriptionSerializer, adapter: :attributes and return
  end

  def destroy
    result = ::BraintreeService::Subscription.cancel(@gateway, params[:id])
    @subscription_resource.remove_subscription()
    render json: {}, status: 204 and return
  end

  private
  def subscription_params
    params.require(:subscription).permit(:payment_method_token)
  end

  def verify_own_subscription
    @subscription_resource = current_member.find_subscribed_resource(params[:id])
    raise Error::NotFound.new if @subscription_resource.nil?
  end

  def verify_customer
    raise Error::Braintree::MissingCustomer.new unless current_member.customer_id
  end
end