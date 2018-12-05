class Admin::InvoiceOptionsController < ApplicationController
  include FastQuery

   def create
    invoice_option = InvoiceOption.new(invoice_params)
    if invoice_option.save
      render json: invoice_option, each_serializer: InvoiceOptionSerializer, root: "invoice_option" and return
    else
      render json: invoice_option.errors.full_messages, status: 500 and return
    end
  end

  def update
    invoice_option = InvoiceOption.find_by(id: params[:id])
    if invoice_option && invoice_option.update(invoice_params)
      render json: invoice_option and return
    else
      render json: invoice_option.errors.full_messages, status: (invoice_option ? 500 : 404) and return
    end
  end

  def destroy
    invoice_option = InvoiceOption.find_by(id: params[:id])
    if invoice_option && invoice_option.delete
      render json: invoice_option and return
    else
      render json: invoice_option.errors.full_messages, status: (invoice_option ? 500 : 404) and return
    end
  end

  private
  def invoice_params
    params.require(:invoice_option).permit(:description, :name, :resource_class, :amount, :plan_id, :quantity, :discount_id, :disabled)
  end
end