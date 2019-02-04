class Admin::InvoicesController < ApplicationController
  include FastQuery
  before_action :find_invoice, only: [:update, :destroy]

  def index
    invoices = admin_index_params.key?(:resourceId) ? Invoice.where(resource_id: admin_index_params[:resourceId]) : Invoice.all
    invoices = query_resource(invoices)

    return render_with_total_items(invoices)
  end

  def create
    invoice = Invoice.create!(invoice_params)
    render json: invoice and return
  end

  def update
    @invoice.update!(invoice_params)
    render json: invoice and return
  end

  def destroy
    @invoice.delete!
    render json: invoice and return
  end

  private
  def invoice_params
    params.require(:invoice).permit(:description, :items, :settled, :amount, :payment_type, :resource_id, :resource_class, :due_date, :member_id)
  end

  def admin_index_params
    params.permit(:resourceId)
  end

  def find_invoice
    @invoice = Invoice.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new if @invoice.nil?
  end
end