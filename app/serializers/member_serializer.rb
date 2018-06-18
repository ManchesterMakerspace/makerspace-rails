class MemberSerializer < ActiveModel::Serializer
  attributes :id,
             :firstname,
             :lastname,
             :expirationTime,
             :email,
             :status,
             :role,
             :groupName
  has_many :learned_skills
  has_many :allowed_workshops
  # has_many :access_cards
end
