class MemberSerializer < ActiveModel::Serializer
  attributes :id,
             :firstname,
             :lastname,
             :expirationTime,
             :email,
             :status,
             :role,
             :card_id,
             :memberContractOnFile,
             :subscription_id,
             :earned_membership_id,
             :customer_id,

  def card_id
    active_card = object.access_cards.to_a.find { |card| card.is_active? }
    active_card && active_card.id
  end

  def earned_membership_id
    object.earned_membership && object.earned_membership.id
  end
end
