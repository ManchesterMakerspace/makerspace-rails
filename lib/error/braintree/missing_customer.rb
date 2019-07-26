require_relative '../custom_error'
module Error::Braintree
  class MissingCustomer < ::Error::CustomError
    def initialize(result=nil)
      super(:missing_customer, 403, "No customer found for required resource.")
    end
  end
end