class SkillSerializer < ActiveModel::Serializer
  attributes :id, :name
  belongs_to :workshop
end
