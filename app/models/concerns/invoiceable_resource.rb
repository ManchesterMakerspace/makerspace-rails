module InvoiceableResource
  extend ActiveSupport::Concern

  included do
    def execute_operation(operation, invoice)
      self.try(operation, invoice.quantity)
    end

    def renew=(num_months)
      now_in_ms = (Time.now.strftime('%s').to_i * 1000)
      current_expiration = self.get_expiration
      if (!!current_expiration && current_expiration > now_in_ms && self.persisted?) #if renewing
        newExpTime = pretty_time + num_months.to_i.months
      else
        newExpTime = Time.now + num_months.to_i.months
      end
      self.update_expiration((newExpTime.to_i * 1000))
    end
  end
end