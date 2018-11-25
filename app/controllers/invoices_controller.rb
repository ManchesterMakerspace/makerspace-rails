class InvoicesController < ApplicationController
  include FastQuery
  include BraintreeGateway

  def index
    invoices =  Invoice.where(member_id: current_member.id)
    invoices = query_resource(invoices)

    return render_with_total_items(invoices)
  end

end