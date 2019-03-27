# Extends Braintree::Subscription to incorporate with Rails
class BraintreeService::Subscription < Braintree::Subscription
  include ImportResource
  include ActiveModel::Serializers::JSON

  attr_accessor :resource, :member

  def self.get_subscriptions(gateway, &search_query)
    subscriptions = gateway.subscription.search { search_query && search_query.call }
    subscriptions.map do |subscription|
      normalize_subscription(gateway, subscription)
    end
  end

  def self.get_subscription(gateway, id)
    subscription = gateway.subscription.find(id)
    normalize_subscription(gateway, subscription)
  end

  def self.cancel(gateway, id)
    gateway.subscription.cancel(id)
  end

  def self.update(gateway, subscription)
    subscription = gateway.subscription.update(
      subscription[:id], # id of subscription to update
      :payment_method_token => subscription[:payment_method_token],
      :plan_id => subscription[:plan_id],
    )
    normalize_subscription(gateway, subscription)
  end

  def self.create(gateway, invoice)
    subscription_obj = {
      payment_method_token: invoice.payment_method_id,
      plan_id: invoice.plan_id,
      id: ::BraintreeService::Subscription.generate_id(invoice)
    }
    if invoice.discount_id
      subscription_obj[:discounts] = {
        add: [{ inherited_from_id: invoice.discount_id }]
      }
    end
    subscription = gateway.subscription.create(subscription_obj)
    normalize_subscription(gateway, subscription)
  end

  def self.read_id(id)
    resource_class, resource_id, hash = id.split("_")
    [resource_class, resource_id]
  end

  def initialize(gateway, args)
    super(gateway, args)
    set_resource
  end

  def self.new(gateway, args)
    super(gateway, args)
  end

  private
  def self.normalize_subscription(gateway, subscription)
      self.new(gateway, instance_to_hash(subscription))
  end

  def set_resource
    resource_class, resource_id = self.class.read_id(id)
    if resource_class && resource_id
      @resource = Invoice.resource(resource_class, resource_id)
      set_member unless @resource.nil?
    end
  end

  def set_member
    if @resource.is_a? Member
      @member = resource
    else
      @member = resource.member
    end
  end
end