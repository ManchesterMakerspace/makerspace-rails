require_relative 'custom_error'
module Error::Braintree
  class CustomerMismatch < CustomError
    def initialize(result)
      super(:customer_mismatch, 403, "Invalid payment method for customer")
    end
  end
end