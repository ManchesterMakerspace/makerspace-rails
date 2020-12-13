class MemberSerializer < MemberSummarySerializer
  attributes :card_id,
             :memberContractOnFile,
             :subscription,
             :subscription_id,
             :earned_membership_id,
             :customer_id,
             :address

  def card_id
    active_card = object.access_cards.to_a.find { |card| card.is_active? }
    active_card && active_card.id
  end

  def earned_membership_id
    object.earned_membership && object.earned_membership.id
  end

  def address
    {
      street: object.address_street,
      unit: object.address_unit,
      city: object.address_city,
      state: object.address_state,
      postal_code: object.address_postal_code
    }
  end
end
