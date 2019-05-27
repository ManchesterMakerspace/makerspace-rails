class BraintreeService::PaymentMethod < Braintree::PaymentMethodNonce
  include ImportResource
  include ActiveModel::Serializers::JSON

  def self.get_payment_methods_for_customer(gateway, customer_id)
    customer = gateway.customer.find(customer_id)
    customer.payment_methods.map do |payment_method|
      normalize_payment_method(gateway, payment_method)
    end
  end

  def self.find_payment_method_for_customer(gateway, payment_method_id, customer_id)
    payment_method = gateway.payment_method.find(payment_method_id)
    raise Error::Braintree::CustomerMismatch.new unless payment_method.customer_id == customer_id
    normalize_payment_method(gateway, payment_method)
  end

  def self.delete_payment_method(gateway, payment_method_id)
    gateway.payment_method.delete(payment_method_id, { revoke_all_grants: true })
  end

  def self.new(gateway, args)
    super(gateway, args)
  end

  private
  def self.normalize_payment_method(gateway, payment_method)
    if payment_method.kind_of?(Braintree::CreditCard)
      normalized_payment_method = ::BraintreeService::CreditCard._new(gateway, instance_to_hash(payment_method))
    elsif payment_method.kind_of?(Braintree::PayPalAccount)
      normalized_payment_method = ::BraintreeService::PaypalAccount._new(gateway, instance_to_hash(payment_method))
    end
    normalized_payment_method ||= payment_method
  end
end