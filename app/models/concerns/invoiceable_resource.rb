module InvoiceableResource
  extend ActiveSupport::Concern

  def create_invoice()
    invoice = new Invoice({ resource_id: self.id })
    invoice.member = self.instance_of? Member ? self : self.member
    invoice.operation_string = self.create_invoice_string()
  end
end