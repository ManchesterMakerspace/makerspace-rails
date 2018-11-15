class RentalSerializer < ActiveModel::Serializer
  attributes :id, :number, :expiration, :description
  belongs_to :member
end
