require_relative '../custom_error'
module Error::Braintree
  class Result < ::Error::CustomError
    ErrorStruct = Struct.new(:attribute, :code, :message)
    
    def initialize(result=nil)
      error = ErrorStruct.new(:service_unavailable, 503, "Service Unavailable")
      unless result.nil?
        if result.transaction && result.transaction.status === Braintree::Transaction::Status::GatewayRejected
          error = ErrorStruct.new(:transaction_rejected, 400, "Gateway rejected transaction")
        else
          if result.errors && result.errors.size
            error = result.errors.map { |e| e.message }.join("\n")
          elsif result.error
            error = result.error
          end
        end
      end
      super(error.attribute, error.code, error.message)
    end
  end
end