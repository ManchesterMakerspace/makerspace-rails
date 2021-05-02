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
        result = callback.call
        update_lifecycle(invoice_id, LIFECYCLES[:Success])
        result
      # Catch any errors, update cache and then rethrow
      rescue => e
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
        rescue => e
            update_lifecycle(invoice_id, LIFECYCLES[:CancelFailed])
            raise
        end
    end

    def self.normalize_invoice_id(invoice_id)
        "#{name}/#{invoice_id}"
    end

    def self.get_invoice_id_from_key(key)
        key.split("/")[1]
    end

    def self.get_all_invoices()
        Redis.current.keys("#{name}/*")
    end

    def self.get_invoice_cache(invoice_id)
        cache = Redis.current.get(normalize_invoice_id(invoice_id))
        JSON.parse(cache) unless cache.nil?
    end

    def self.get_lifecycle(invoice_id)
        cache_hash = get_invoice_cache(invoice_id)
        cache_hash["lifecycle"] unless cache_hash.nil?
    end

    def self.get_timestamp(invoice_id)
        cache_hash = get_invoice_cache(invoice_id)
        timestamp = cache_hash["timestamp"] unless cache_hash.nil?
        Time.at(timestamp) unless timestamp.nil?
    end

    def self.update_lifecycle(invoice_id, lifecycle)
        Redis.current.set(normalize_invoice_id(invoice_id), {
            lifecycle: lifecycle,
            timestamp: Time.now.to_i
        }.to_json)
    end
end