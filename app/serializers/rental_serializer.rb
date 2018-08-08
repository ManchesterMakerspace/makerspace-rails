class RentalSerializer < ActiveModel::Serializer
  attributes :id, :number, :expiration, :member

  def member
    object.member && "#{object.member.fullname}"
  end
end
