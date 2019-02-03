require_relative '../custom_error'
module Error::Braintree
  class MissingCustomer < ::Error::CustomError
    def initialize(result)
      super(:missing_customer, 422, "No customer found for required resource.")
    end
  end
end