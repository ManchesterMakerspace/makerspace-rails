# Extends Braintree::Discount to incorporate with Rails
class BraintreeService::Discount < Braintree::Discount
  include ImportResource
  include ActiveModel::Serializers::JSON

  attr_accessor :id, :name, :description, :amount

  def initialize(props)
    self.id = props[:id]
    self.name = props[:name]
    self.description = props[:description]
    self.amount = props[:amount]
  end

  def self.new(args)
    super(args)
  end

  def self.get_discounts(gateway)
    discounts = gateway.discount.all.map do |discount|
      self.new(instance_to_hash(discount))
    end
    discounts.push(self.standard_membership_discount)
    discounts
  end

  private
  def self.standard_membership_discount
    self.new({
      id: "standard_membership_sso",
      name: "Standard Membership student, senior, military discount (10%)",
      description: "10% Discount for all student, senior (+65) and military. Proof of applicable affiliation may be required during orientation.",
      amount: 8
    })
  end
end