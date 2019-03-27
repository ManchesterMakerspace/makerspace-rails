# Extends Braintree::Plan to incorporate with Rails
class BraintreeService::Plan < Braintree::Plan
  include ImportResource
  include ActiveModel::Serializers::JSON

  # Braintree::Plan (https://developers.braintreepayments.com/reference/response/plan/ruby)
  # billing_day_of_month
  # billing_frequency
  # description
  # id
  # name
  # discounts
  # price

  def self.new(gateway, args)
    super(gateway, args)
  end

  def self.get_plans(gateway)
    gateway.plan.all.map do |plan|
      self.new(gateway, instance_to_hash(plan))
    end
  end

  def self.select_plans_for_types(types, plans_to_filter)
    plans = []
    if types.include?("member")
      plans.concat(self.get_membership_plans(plans_to_filter))
    end
    if types.include?("rental")
      plans.concat(self.get_rental_plans(plans_to_filter))
    end
    plans
  end

  def self.get_membership_plans(plans)
    plans.select { |plan| /membership/.match(plan.id) }
  end

  def self.get_rental_plans(plans)
    plans.select { |plan| /rental/.match(plan.id) }
  end

  def self.get_plan_by_id(gateway, id)
    return if id.nil?
    plans = self.get_plans(gateway)
    plans.find { |plan| plan.id == id } unless plans.nil?
  end
end