class MemberSummarySerializer < ActiveModel::Serializer
  attributes :id,
             :firstname,
             :lastname,
             :expirationTime,
             :email,
             :status,
             :role,
             :member_contract_signed_date,
             :member_contract_on_file,
             :notes,

  def member_contract_on_file
    !object.member_contract_signed_date.nil?
  end
end
