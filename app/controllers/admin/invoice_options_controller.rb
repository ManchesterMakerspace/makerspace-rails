class Admin::InvoiceOptionsController < ApplicationController
  include FastQuery

   def create
    invoice_option = InvoiceOption.new(invoice_params)
    invoice_option.save!
    render json: invoice_option, each_serializer: InvoiceOptionSerializer, root: "invoice_option" and return
  end

  def update
    invoice_option = InvoiceOption.find(params[:id])
    invoice_option.update!(invoice_params)
    render json: invoice_option and return
  end

  def destroy
    invoice_option = InvoiceOption.find(params[:id])
    invoice_option.delete!
    render json: invoice_option and return
  end

  private
  def invoice_params
    params.require(:invoice_option).permit(:description, :name, :resource_class, :amount, :plan_id, :quantity, :discount_id, :disabled)
  end
end