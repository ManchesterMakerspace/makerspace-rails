class RentalSerializer < ActiveModel::Serializer
  attributes :id, :number, :expiration
  belongs_to :member
end
