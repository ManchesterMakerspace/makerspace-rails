class InvoicesController < ApplicationController
  include FastQuery
  include BraintreeGateway

  def index
    invoices =  Invoice.where(member_id: current_member.id, settled_at: nil)
    invoices = query_resource(invoices)

    return render_with_total_items(invoices)
  end

  def create
    invoice_option = InvoiceOption.find(invoice_option_params[:id])
    if (invoice_option_params[:discount_id])
      discounts = ::BraintreeService::Discount.get_discounts(@gateway)
      invoice_discount = discounts.find { |d| d.id == invoice_option_params[:discount_id]}
    end

    @invoice = invoice_option.build_invoice(@member.id, Time.now, current_member.id, invoice_discount)
    @invoice.save!
    render json: @invoice and return
  end


  private
  def invoice_option_params
    params.require(:invoice_option).permit(:id, :discount_id)
  end
end