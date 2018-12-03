class InvoiceOptionsController < ApplicationController
  include FastQuery

  def index
    if invoice_option_params[:types]
      invoice_option_types = invoice_option_params[:types].kind_of?(Array) ? invoice_option_params[:types] : [invoice_option_params[:types]]
    end
    invoice_options = invoice_option_types ? InvoiceOption.where(:resource_class.in => invoice_option_types) : InvoiceOption.all
    return render_with_total_items(invoice_options, { each_serializer: InvoiceOptionSerializer, root: "invoice_options" })
  end

  private
  def invoice_option_params
    params.permit(:types)
  end
end