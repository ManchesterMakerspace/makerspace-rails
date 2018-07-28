# Extends Braintree::Plan to incorporate with Rails
class BraintreeService::Plan < Braintree::Plan
  include ActiveModel::Serialization

  def self.get_plans(gateway)
    gateway.plan.all.map do |plan|
      self.new(gateway, get_base_attr(plan))
    end
  end

  private
  # Build BraintreeService:Plan from Braintree::Plan
  def self.get_base_attr(plan)
    plan_vars = Hash.new
    plan.instance_variables.each do |v| 
      normalized_name = v.to_s.sub(/^@/, '').to_sym
      plan_vars[normalized_name] = plan.instance_variable_get(v)
    end
    plan_vars
  end
end