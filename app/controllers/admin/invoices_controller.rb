class Admin::InvoicesController < ApplicationController
  include FastQuery

  def index
    invoices = admin_index_params.key?(:resourceId) ? Invoice.where(resource_id: admin_index_params[:resourceId]) : Invoice.all
    invoices = query_resource(invoices)

    return render_with_total_items(invoices)
  end

  def create
    invoice = Invoice.new(invoice_params)
    if invoice.save
      render json: invoice and return
    else
      render json: invoice.errors.full_messages, status: 500 and return
    end
  end

  def update
    invoice = Invoice.find_by(id: params[:id])
    if invoice && invoice.update(invoice_params)
      render json: invoice and return
    else
      render json: invoice.errors.full_messages, status: (invoice ? 500 : 404) and return
    end
  end

  def destroy
    invoice = Invoice.find_by(id: params[:id])
    if invoice && invoice.delete
      render json: invoice and return
    else
      render json: invoice.errors.full_messages, status: (invoice ? 500 : 404) and return
    end
  end

  private
  def invoice_params
    params.require(:invoice).permit(:description, :items, :settled, :amount, :payment_type, :resource_id, :due_date, :member_id)
  end
  def admin_index_params
    params.permit(:resourceId)
  end
end