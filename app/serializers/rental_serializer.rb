class RentalSerializer < ActiveModel::Serializer
  attributes :id, 
             :number, 
             :description, 
             :expiration, 
             :member_name, 
             :member_id,
             :subscription_id,
             :contract_on_file

  def member_name
    object.member && "#{object.member.fullname}"
  end
end
