class GroupSerializer < ActiveModel::Serializer
  attributes :id, :groupName, :expiry
end
