class Admin::InvoiceOptionsController < ApplicationController
  include FastQuery

  def index
    invoice_options = invoice_option_params ? InvoiceOption.where(resource_class: invoice_option_params[:type]) : InvoiceOption.all
    return render_with_total_items(invoice_options)
  end

  private
  def invoice_option_params
    params.permit(:types)
  end
end