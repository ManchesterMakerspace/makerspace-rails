class Braintree::PlanSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :amount, :billing_frequency
end
