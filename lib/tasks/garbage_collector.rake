desc "Clean up old redis keys"
task :gc => :environment do 
    begin
        last_month = Time.now - 30.days 
        relevant_keys = InvoiceHelper.get_all_invoices().select do |key|
            invoice_id = InvoiceHelper.get_invoice_id_from_key(key)
            timestamp = InvoiceHelper.get_timestamp(invoice_id)
            timestamp >= last_month
        end
        Redis.current.del(*relevant_keys) unless relevant_keys.empty?
        slack_message = "Pruned #{relevant_keys.length} Redis keys from last month."
    rescue => e 
        error = "#{e.message}\n#{e.backtrace.inspect}"
        slack_message = "Error cleaning Redis: #{error}"
    end

  ::Service::SlackConnector.send_slack_message(slack_message, ::Service::SlackConnector.logs_channel)
end
