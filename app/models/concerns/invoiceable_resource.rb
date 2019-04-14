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
        newExpTime = expiration_as_time + num_months.to_i.months
      else
        newExpTime = Time.now + num_months.to_i.months
      end
      self.update_expiration((newExpTime.to_i * 1000))
    end

    def pretty_time
      if self.get_expiration
        return self.expiration_as_time
      else
        return Time.at(0)
      end
    end

    def get_expiration
      self[self.expiration_attr]
    end

    protected
    def update_expiration(new_expiration)
      self.update_attributes!(self.expiration_attr => expiration_as_ms(new_expiration))
    end

    def expiration_as_time(ms = nil)
      exp ||= self.get_expiration
      if exp.is_a? Numeric
        return Time.at(exp/1000)
      else
        return Time.parse(exp.to_s)
      end
    end

    def expiration_as_ms(exp = nil)
      exp ||= self.get_expiration
      if exp.is_a? Numeric
        return exp
      else
        return Time.parse(exp.to_s).to_i * 1000
      end
    end
  end
end