class Admin::Billing::SubscriptionsController < Admin::BillingController
  def index
    subs = ::BraintreeService::Subscription.get_subscriptions(@gateway, construct_query)
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
  def construct_query
    Proc.new do |search|
      unless subscription_query_params[:search].nil?
        members = Member.search(subscription_query_params[:search])
        sub_ids = members.map(&:subscription_id).reject { |m| m.nil? }
        search.ids.in(sub_ids) unless sub_ids.empty?
      end

      unless subscription_query_params[:customer_id].nil?
        member = Member.find_by(customer_id: subscription_query_params[:customer_id])
        if member && member.subscription_id
          search.id.is(member.subscription_id)
        end
      end

      if (subscription_query_params[:end_date] && subscription_query_params[:start_date])
        search.created_at.between(subscription_query_params[:start_date], subscription_query_params[:end_date])
      elsif subscription_query_params[:start_date]
        search.created_at >= subscription_query_params[:start_date]
      elsif subscription_query_params[:end_date]
        search.created_at <= subscription_query_params[:end_date]
      end

      query_array(subscription_query_params[:subscription_status], search.status) unless subscription_query_params[:subscription_status].nil?
      query_array(subscription_query_params[:plan_id], search.plan_id) unless subscription_query_params[:plan_id].nil?
    end
  end

  def subscription_query_params
    params.permit(:start_date, :end_date, :search, :customer_id, :subscription_status => [], :plan_id => [])
  end
end