class InvoiceOptionSerializer < ApplicationSerializer
  attributes :id,
             :name,
             :description,
             :amount,
             :plan_id,
             :quantity,
             :resource_class,
             :disabled
end