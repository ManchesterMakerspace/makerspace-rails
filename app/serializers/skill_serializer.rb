class SkillSerializer < ActiveModel::Serializer
  attributes :_id, :name
  belongs_to :workshop
end
