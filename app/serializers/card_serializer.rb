class CardSerializer < ActiveModel::Serializer
  attributes :holder, :expiry, :validity
  belongs_to :member
end
