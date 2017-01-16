class WorkshopSerializer < ActiveModel::Serializer
  attributes :_id, :name
  has_many :skills
  belongs_to :officer, class_name: "Member"
  has_many :experts, class_name: "Member"
end
