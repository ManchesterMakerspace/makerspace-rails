class InvoiceOptionsController < ApplicationController
  include FastQuery::MongoidQuery
  before_action :find_invoice_option, only: [:show]

  def index
    enabled_options = (is_admin? || invoice_option_params[:only_enabled]) ? InvoiceOption.all : InvoiceOption.where(disabled: false)
    if invoice_option_params[:subscription_only]
      enabled_options = enabled_options.where({ :plan_id.nin => ["", nil] })
    end
    invoice_option_types = invoice_option_params[:types]
    invoice_options = invoice_option_types ? enabled_options.where(:resource_class.in => invoice_option_types) : enabled_options
    render_with_total_items(invoice_options, { each_serializer: InvoiceOptionSerializer, adapter: :attributes })
  end

  def show
    render json: @invoice_option, adapter: :attributes and return
  end

  private
  def invoice_option_params
    params.permit(:subscription_only, :only_enabled, :types => [])
  end

  def find_invoice_option
    @invoice_option = InvoiceOption.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(InvoiceOption, { id: params[:id] }) if @invoice_option.nil?
  end
end