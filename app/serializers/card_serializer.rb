class CardSerializer < ActiveModel::Serializer
  attributes :id, :holder, :expiry, :validity, :uid
  belongs_to :member
end
