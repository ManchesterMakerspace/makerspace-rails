class MemberSerializer < ActiveModel::Serializer
  attributes :_id, :fullname, :expirationTime
  has_many :learned_skills
end
