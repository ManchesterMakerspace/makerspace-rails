require_relative '../custom_error'
module Error::Braintree
  class CustomerMismatch < ::Error::CustomError
    def initialize(result=nil)
      super(:customer_mismatch, 403, "Invalid payment method for customer")
    end
  end
end