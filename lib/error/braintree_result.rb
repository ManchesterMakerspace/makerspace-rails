require_relative 'custom_error'
module Error
  class BraintreeResult < CustomError
    def initialize(result)
      error = result.errors.first
      super(error.attribute, error.code, error.message)
    end
  end
end