class MemberSummarySerializer < ActiveModel::Serializer
  attributes :id,
             :firstname,
             :lastname,
             :phone,
             :expirationTime,
             :email,
             :status,
             :role,
             :memberContractOnFile,
             :notes,

  def address
  end
end
