class MemberSerializer < ActiveModel::Serializer
  attributes :_id, :fullname, :expirationTime, :email
  has_many :learned_skills
end
