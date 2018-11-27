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
end