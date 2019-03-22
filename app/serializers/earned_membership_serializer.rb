class EarnedMembershipSerializer < ActiveModel::Serializer
  attributes :id, :member_id, :member_name, :member_status, :member_expiration
  has_many :requirements, serializer: EarnedMembership::RequirementSerializer

  def member_name
    object.member && "#{object.member.fullname}"
  end

  def member_status
    object.member && object.member.status
  end

  def member_expiration
    object.member && object.member.expirationTime
  end
end
