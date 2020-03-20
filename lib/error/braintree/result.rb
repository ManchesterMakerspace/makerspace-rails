require_relative '../custom_error'
module Error::Braintree
  class Result < ::Error::CustomError
    ErrorStruct = Struct.new(:attribute, :code, :message)

    def initialize(result=nil)
      error = ErrorStruct.new(:service_unavailable, 503, "Service Unavailable")
      unless result.nil?
        if result.transaction && result.transaction.status === Braintree::Transaction::Status::GatewayRejected
          error = ErrorStruct.new(:transaction_rejected, 400, "Gateway rejected transaction")
        elsif result.verification
          error = ErrorStruct.new(:validation_failed, 400, result.verification.status)
        else
          error = ErrorStruct.new(:braintree_error, 400, result.message)
        end
      end
      super(error.attribute, error.code, error.message)
    end
  end
end