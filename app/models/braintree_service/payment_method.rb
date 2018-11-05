class BraintreeService::PaymentMethod < Braintree::PaymentMethodNonce
  include ImportResource
  include ActiveModel::Serializers::JSON

  def self.get_payment_methods_for_customer(gateway, customer_id)
    customer = gateway.customer.find(customer_id)
    customer.payment_methods.map do |payment_method|
      if payment_method.kind_of?(Braintree::CreditCard)
        normalized_payment_method = ::BraintreeService::CreditCard._new(gateway, instance_to_hash(payment_method))
      elsif payment_method.kind_of?(Braintree::PayPalAccount)
        normalized_payment_method = ::BraintreeService::PaypalAccount._new(gateway, instance_to_hash(payment_method))
      end
      normalized_payment_method
    end
  end
end