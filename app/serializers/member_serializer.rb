class MemberSerializer < ActiveModel::Serializer
  attributes :id,
             :firstname,
             :lastname,
             :expirationTime,
             :email,
             :status,
             :role,
             :card_id,
             :subscription_id,

  def card_id
    active_card = object.access_cards.to_a.find { |card| card.is_active? }
    active_card && active_card.id
  end
end
