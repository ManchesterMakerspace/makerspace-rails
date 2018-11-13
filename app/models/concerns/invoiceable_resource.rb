module InvoiceableResource
  extend ActiveSupport::Concern

  def execute_operation(invoice)
    self.subscription = true if !invoice.subscription_id.nil?
    self.renewal = invoice.quantity
    return self.save
  end

  def create_invoice(details)
    member = self.instance_of? Member ? self : self.member
    invoice = new Invoice(
      {
        resource_id: self.id,
        resource_class: self.class.name,
        member: member,
        contact: member.email,
        due_date: Time.now
        quantity: 1
        amount: self.default_invoice_amount
      }
    )
    if !details.nil?
      details.each { |key, value| invoice.send(key, value) }
    end
  end

  def execute_operation(operation, invoice)
    self.subscription = true if !invoice.subscription_id.nil?
    if (operation == :renew)
      self.renewal = invoice.quantity
    end
    return self.save
  end

  def renewal=(num_months)
    now_in_ms = (Time.now.strftime('%s').to_i * 1000)
    if (!!self.expirationTime && self.try(self.expiration_attr) > now_in_ms && self.persisted?) #if renewing
      newExpTime = prettyTime + num_months.to_i.months
    else
      newExpTime = Time.now + num_months.to_i.months
    end
    self.update_attribute(self.expiration_attr,  (newExpTime.to_i * 1000) )
  end
end