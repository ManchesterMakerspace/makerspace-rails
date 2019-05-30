class Admin::Billing::SubscriptionsController < Admin::BillingController
    include FastQuery
    include BraintreeGateway

  def index
    # TODO actually query subscriptions instead of filtering results
    subs = ::BraintreeService::Subscription.get_subscriptions(@gateway)
    subs = subs.select { |s| s.status != Braintree::Subscription::Status::Canceled } if params[:hideCanceled]
    return render_with_total_items(subs, { :each_serializer => BraintreeService::SubscriptionSerializer, root: "subscriptions" })
  end

  def destroy
    subscription = ::BraintreeService::Subscription.get_subscription(@gateway, params[:id])
    result = ::BraintreeService::Subscription.cancel(@gateway, params[:id])
    raise Error::Braintree::Result.new(result) unless result.success?

    # Verify resource exists and call update on that resource
    subscription.resource.remove_subscription() unless subscription.resource.nil?
    render json: {}, status: 204 and return
  end
end