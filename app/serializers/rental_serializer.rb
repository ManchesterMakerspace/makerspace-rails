class RentalSerializer < ActiveModel::Serializer
  attributes :id, :number, :expiration, :member_name, :member_id

  def member_name
    object.member && "#{object.member.fullname}"
  end
end
