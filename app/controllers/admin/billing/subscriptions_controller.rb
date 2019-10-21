class Admin::Billing::SubscriptionsController < Admin::BillingController
  include FastQuery

  def index
    # TODO actually query subscriptions instead of filtering results
    if to_bool(params[:hideCanceled])
      subs = ::BraintreeService::Subscription.get_subscriptions(@gateway, Proc.new do |search| 
        search.status.in(
          Braintree::Subscription::Status::Active,
          Braintree::Subscription::Status::Expired,
          Braintree::Subscription::Status::PastDue,
          Braintree::Subscription::Status::Pending
        )
      end)
    else
      subs = ::BraintreeService::Subscription.get_subscriptions(@gateway)
    end
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

  private 
  def admin_index_params
    params.permit(:hideCanceled)
  end
end