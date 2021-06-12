class RentalSerializer < ActiveModel::Serializer
  attributes :id, 
             :number, 
             :description, 
             :expiration, 
             :member_name, 
             :member_id,
             :subscription_id,
             :contract_on_file,
             :contract_signed_date,
             :notes,

  def member_name
    object.member && "#{object.member.fullname}"
  end

  def contract_on_file
    !object.contract_signed_date.nil?
  end
end
