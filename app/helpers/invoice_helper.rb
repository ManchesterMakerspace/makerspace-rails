module InvoiceHelper
    LIFECYCLES = {
        InProgress: "IN_PROGRESS",
        Success: "SUCCESS",
        Failed: "FAILED",
        Cancelling: "CANCELLING",
        CancelFailed: "CANCEL_FAILED",
        Cancelled: "CANCELLED"
    }

    def self.pay_workflow(invoice_id, callback)
      # Lock invoice so any notifications from settlement dont duplicate settlement operations
      begin
        update_lifecycle(invoice_id, LIFECYCLES[:InProgress])
        # Handling actual payment & related error handling is abstracted from this controller
        transaction = callback.call
        update_lifecycle(invoice_id, LIFECYCLES[:Success])
        transaction
      # Catch any errors, update cache and then rethrow
      rescue StandardError => e
        update_lifecycle(invoice_id, LIFECYCLES[:Failed])
        raise
      end
    end

    def self.cancel_workflow(invoice_id, callback)
        begin
            update_lifecycle(invoice_id, LIFECYCLES[:Cancelling])
            result = callback.call
            update_lifecycle(invoice_id, LIFECYCLES[:Cancelled])
            raise Error::Braintree::Result.new(result) unless result.success?
            result
        rescue StandardError => e
            update_lifecycle(invoice_id, LIFECYCLES[:CancelFailed])
            raise
        end
    end

    def self.get_lifecycle(invoice_id)
        Redis.current.get(invoice_id)
    end

    def self.update_lifecycle(invoice_id, lifecycle)
        Redis.current.set(invoice_id, lifecycle)
    end
end