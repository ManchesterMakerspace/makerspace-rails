class MemberSerializer < ActiveModel::Serializer
  attributes :id,
             :fullname,
             :expirationTime,
             :email,
             :status,
             :role,
             :slackHandle,
             :groupName
  has_many :learned_skills
  has_many :allowed_workshops
  has_many :access_cards
end
