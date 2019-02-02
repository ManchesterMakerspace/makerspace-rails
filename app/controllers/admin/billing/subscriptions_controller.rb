class Admin::Billing::SubscriptionsController < ApplicationController
    include FastQuery
    include BraintreeGateway

  def index
    subs = ::BraintreeService::Subscription.get_subscriptions(@gateway)
    subs = subs.select { |s| s.status != Braintree::Subscription::Status::Canceled } if params[:hideCanceled]
    return render_with_total_items(subs, { :each_serializer => Braintree::SubscriptionSerializer, root: "subscriptions" })
  end

  def destroy
    subscription = ::BraintreeService::Subscription.get_subscription(@gateway, params[:id])
    result = ::BraintreeService::Subscription.cancel(@gateway, params[:id])
    raise Error::BraintreeResultError.new(result) unless result.success?

    # Verify resource exists and call update on that resource
    if subscription.resource.nil? || subscription.resource.remove_subscription()
      render json: {}, status: 204 and return
    end
  end
end