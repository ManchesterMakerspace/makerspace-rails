# Extends Braintree::Plan to incorporate with Rails
class BraintreeService::Plan < Braintree::Plan
  include ImportResource
  include ActiveModel::Serialization

  def self.get_plans(gateway)
    gateway.plan.all.map do |plan|
      self.new(gateway, instance_to_hash(plan))
    end
  end
end