class MemberSerializer < ActiveModel::Serializer
  attributes :id, :fullname, :expirationTime, :email, :role
  has_many :learned_skills
  has_many :allowed_workshops
end
