# Extends Braintree::Subscription to incorporate with Rails
class BraintreeService::Subscription < Braintree::Subscription
  include ImportResource
  include ActiveModel::Serializers::JSON

  def self.get_subscriptions(gateway, &search_query)
    subscriptions = gateway.subscription.search { search_query && search_query.call }
    subscriptions.map do |subscription|
      self.new(gateway, instance_to_hash(subscription))
    end
  end

  def self.get_subscription(gateway, id)
    gateway.subscription.find(id)
  end

  def self.cancel(gateway, id)
    gateway.subscription.cancel(id)
  end

  def self.update(gateway, subscription)
    gateway.subscription.update(
      subscription[:id], # id of subscription to update
      :payment_method_token => subscription[:payment_method_token],
      :plan_id => subscription[:plan_id],
    )
  end

  def self.create(gateway, subscription)
    gateway.subscription.create(
      :payment_method_token => subscription[:payment_method_token],
      :plan_id => subscription[:plan_id]
    )
  end
end