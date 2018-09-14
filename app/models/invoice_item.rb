class InvoiceItem
  include Mongoid::Document
  embedded_in :invoice

  field :resource
  field :amount, type: Float
  field :operation_string # Encoded string detailing the operation(s) to perfom on settlement

end