require_relative 'custom_error'
module Error::Braintree
  class Result < CustomError
    def initialize(result)
      error = {
        attribute: :service_unavailable,
        code: 503,
        message: "Service Unavailabler"
      }
      if result.transaction && result.transaction.status === Braintree::Transaction::Status::GatewayRejected
        error = {
          attribute: :transaction_rejected,
          code: 400,
          message: "Gateway rejected transaction"
        }
      else
        if result.errors && result.errors.size
          error = result.errors.map { |e| e.message }.join("\n")
        elsif result.error
          error = result.error
        end
      end
      super(error.attribute, error.code, error.message)
    end
  end
end