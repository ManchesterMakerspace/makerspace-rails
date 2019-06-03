class InvoicesController < AuthenticationController
  include FastQuery
  include BraintreeGateway

  def index
    invoices =  Invoice.where(member_id: current_member.id, settled_at: nil)
    invoices = query_resource(invoices)

    return render_with_total_items(invoices)
  end

  def show 
    invoice = Invoice.find_by(member_id: current_member.id, id: params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { id: params[:id] }) if invoice.nil?
  end

  def create
    raise ActionController::ParameterMissing.new(:id) if invoice_option_params[:id].nil?
    invoice_option = InvoiceOption.find(invoice_option_params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(InvoiceOption, { id: invoice_option_params[:id] }) if invoice_option.nil?
    if (invoice_option_params[:discount_id])
      discounts = ::BraintreeService::Discount.get_discounts(@gateway)
      invoice_discount = discounts.find { |d| d.id == invoice_option_params[:discount_id]}
    end

    @invoice = invoice_option.build_invoice(current_member.id, Time.now, current_member.id, invoice_discount)
    render json: @invoice and return
  end


  private
  def invoice_option_params
    params.require(:invoice_option).permit(:id, :discount_id)
  end
end