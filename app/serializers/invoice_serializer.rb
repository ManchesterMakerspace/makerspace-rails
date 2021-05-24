class InvoiceSerializer < ApplicationSerializer
  attributes :id,
             :name,
             :description,
             :settled,
             :past_due,
             :created_at,
             :due_date,
             :amount,
             :subscription_id,
             :transaction_id,
             :plan_id,
             :resource_class,
             :resource_id,
             :quantity,
             :discount_id,
             :member_id,
             :member_name,
             :refunded,
             :refund_requested,
             :resource

  has_one :member, serializer: MemberSerializer

  def member_id
    object.member && object.member.id
  end

  def amount
    object.amount.truncate.to_s + '.' + sprintf('%02d', (BigDecimal(object.amount.to_s).frac * 100).truncate)
  end

  def member_name
    object.member && object.member.fullname
  end

  def resource
    unless object.resource.nil?
      if object.resource_class == "member"
        MemberSerializer.new(object.resource)
      elsif object.resource_class == "rental"
        RentalSerializer.new(object.resource)
      end
    end
  end
end