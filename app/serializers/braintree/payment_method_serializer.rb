class Braintree::PaymentMethodSerializer < ActiveModel::Serializer
  private
  def common_attributes
    [
      :customer_id
    ]
  end

  def credit_card_attributes
    [
      :card_type,
      :expiration_month,
      :expiration_year,
      :last_4
    ]
  end

  def paypal_attributes
    []
  end

  def attributes(*attrs)
    fields = super(attrs)

    common_attributes.each { |a| fields[a] = object.send(a) }

    if object.kind_of?(::BraintreeService::CreditCard)
      credit_card_attributes.each { |a| fields[a] = object.send(a) }
      fields[:payment_type] = :credit_card
    elsif object.kind_of?(::BraintreeService::PaypalAccount)
      paypal_attributes.each { |a| fields[a] = object.send(a) }
      fields[:payment_type] = :paypal
    end
    fields[:id] ||= object.token
    fields
  end
end