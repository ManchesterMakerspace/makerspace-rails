# Extends Braintree::Plan to incorporate with Rails
class BraintreeService::Plan < Braintree::Plan
  include ImportResource
  include ActiveModel::Serialization

  # Braintree::Plan (https://developers.braintreepayments.com/reference/response/plan/ruby)
  # billing_day_of_month
  # billing_frequency
  # description
  # id
  # name
  # discounts
  # price

  def self.get_plans(gateway)
    gateway.plan.all.map do |plan|
      self.new(gateway, instance_to_hash(plan))
    end
  end

  def self.get_membership_plans(gateway)
    self.get_plans.filter { |plan| /membership/.match(plan.id) }
  end

  def self.get_plan_by_id(gateway, id)
    return if id.nil?
    plans = self.get_plans(gateway)
    plans.find { |plan| plan.id == id } unless plans.nil?
  end

  def amount
    self.price.truncate.to_s + '.' + sprintf('%02d', (self.price.frac * 100).truncate)
  end

  def build_invoice(member_id=nil, due_date=nil)
    invoice_args = {
      subscription_id: self.id,
      amount: self.amount,
      description: self.description,
      discounts: self.discounts,
      operation_string: self.build_operation_string,
      due_date: due_date,
      member_id: member_id
    }
    Invoice.new(invoice_args)
  end

  def build_operation_string
    "#{Invoice::OPERATION_RESOURCE_PLACEHOLDER}.renewal = #{self.billing_frequency}"
  end
end