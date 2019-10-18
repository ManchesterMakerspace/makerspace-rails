# Extends Braintree::Subscription to incorporate with Rails
class BraintreeService::Subscription < Braintree::Subscription
  include ImportResource
  include ActiveModel::Serializers::JSON
  extend Service::SlackConnector

  attr_accessor :resource, :member

  def self.get_subscriptions(gateway, search_query = nil)
     subscriptions = gateway.subscription.search { |search| search_query && search_query.call(search) }
     subscriptions.map do |subscription|
      normalize_subscription(gateway, subscription)
    end
  end

  def self.get_subscription(gateway, id)
    subscription = gateway.subscription.find(id)
    normalize_subscription(gateway, subscription)
  end

  def self.cancel(gateway, id)
    result = gateway.subscription.cancel(id)
    raise Error::Braintree::Result.new(result) unless result.success?
    # Destroy invoices for this subscription that are still outstanding
    invoice = Invoice.find_by(subscription_id: id)
    Invoice.where(subscription_id: id, settled_at: nil, transaction_id: nil).destroy

    if invoice
      slack_user = SlackUser.find_by(member_id: invoice.member_id)
      type = invoice.resource_class == "member" ? "membership" : "rental"
      message = "#{invoice.member.fullname}'s #{type} subscription has been canceled."
      send_slack_message(message, ::Service::SlackConnector.safe_channel(slack_user.slack_id)) unless slack_user.nil?
      send_slack_message(message, ::Service::SlackConnector.members_relations_channel)
      BillingMailer.canceled_subscription(invoice.member.email, invoice.id.to_s).deliver_later
    end

    result
  end

  def self.update(gateway, subscription_hash)
    result = gateway.subscription.update(
      subscription_hash[:id], # id of subscription to update
      :payment_method_token => subscription_hash[:payment_method_token],
    )
    raise ::Error::Braintree::Result.new(result) unless result.success?
    normalize_subscription(gateway, result.subscription)
  end

  def self.create(gateway, invoice)
    # Don't create a new subscription if already on subscription
    if invoice.plan_id &&
       (invoice.resource.try(:subscription) || invoice.resource.try(:subscription_id))
      raise ::Error::UnprocessableEntity.new("Subscription already exists for #{invoice.member.fullname}. Please contact support")
    end

    subscription_hash = {
      payment_method_token: invoice.payment_method_id,
      plan_id: invoice.plan_id,
      id: invoice.generate_subscription_id
    }
    if invoice.discount_id
      subscription_hash[:discounts] = {
        add: [{ inherited_from_id: invoice.discount_id }]
      }
    end
    result = gateway.subscription.create(subscription_hash)
    raise ::Error::Braintree::Result.new(result) unless result.success?
    normalize_subscription(gateway, result.subscription)
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