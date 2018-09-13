class InvoicesController < ApplicationController
    include FastQuery

  def index
    params[:orderBy] ||= :created_at
    invoices = params[:filter] ? Invoice.where(
      params[:filter][:property] => params[:filter][:criteria]) : Invoice
    invoices = query_resource(invoices, params)

    return render_with_total_items(invoices)
  end

  def create
    invoice = Invoice.new(invoice_params)
    if invoice.save
      render json: invoice and return
    else
      render json: invoice.error.full_messages, status: 500 and return
    end
  end

  def update
    invoice = Invoice.find_by(id: params[:id])
    if invoice && invoice.update(invoice_params)
      render json: invoice and return
    else
      render json: invoice.error.full_messages, status: (invoice ? 500 : 404) and return
    end
  end

  private
  def invoice_params
    params.require(:invoice).permit(:description, :contact, :items, :settled, :amount, :payment_type)
  end
end