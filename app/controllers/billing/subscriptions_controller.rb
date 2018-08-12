class Billing::SubscriptionsController < ApplicationController
    include FastQuery
    include BraintreeGateway

  def index
    subs = ::BraintreeService::Subscription.get_subscriptions(@gateway)
    return render_with_total_items(subs, { :each_serializer => Braintree::SubscriptionSerializer})
  end
end