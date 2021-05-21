class Admin::InvoiceOptionsController < AdminController
  include FastQuery::MongoidQuery
  before_action :find_invoice_option, only: [:update, :destroy]

   def create
    invoice_option = InvoiceOption.new(create_params)
    invoice_option.save!
    render json: invoice_option, each_serializer: InvoiceOptionSerializer, adapter: :attributes and return
  end

  def update
    @invoice_option.update_attributes!(invoice_params)
    render json: @invoice_option, adapter: :attributes and return
  end

  def destroy
    @invoice_option.destroy
    render json: {}, status: 204 and return
  end

  private
  def create_params
    params.require([:name, :resource_class, :amount,  :quantity])
    invoice_params
  end

  def invoice_params
    params.permit(:description, :name, :resource_class, :amount,  :quantity, :disabled, :plan_id, :discount_id, :promotion_end_date)
  end

  def find_invoice_option
    @invoice_option = InvoiceOption.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(InvoiceOption, { id: params[:id] }) if @invoice_option.nil?
  end
end