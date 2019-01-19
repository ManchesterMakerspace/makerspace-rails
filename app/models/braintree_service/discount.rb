# Extends Braintree::Discount to incorporate with Rails
class BraintreeService::Discount
  include ImportResource
  include ActiveModel::Serializers::JSON

  attr_accessor :id, :name, :description, :amount

  def initialize(props)
    self.id = props[:id]
    self.name = props[:name]
    self.description = props[:description]
    self.amount = props[:amount]
  end

  def self.get_discounts(gateway)
    gateway.discount.all.map do |discount|
      self.new(instance_to_hash(discount))
    end
  end
end