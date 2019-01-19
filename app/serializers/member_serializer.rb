class MemberSerializer < ActiveModel::Serializer
  attributes :id,
             :firstname,
             :lastname,
             :expirationTime,
             :email,
             :status,
             :role,
             :groupName,
             :card_id,
             :groupName,
             :subscription_id,
  # has_many :learned_skills
  # has_many :allowed_workshops
  # has_many :access_cards
  def card_id
    active_card = object.access_cards.to_a.find { |card| card.isActive }
    active_card && active_card.id
  end
end
