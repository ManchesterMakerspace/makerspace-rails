class Admin::InvoicesController < AdminController
  include FastQuery::MongoidQuery
  before_action :find_invoice, only: [:update, :destroy]

  def index
    @queries = invoice_query_params.keys.map do |k|
      key = k.to_sym

      if key === :settled
        query = { "$or" => [
          query_existance_by_name(invoice_query_params[:settled], :settled_at),
          query_existance_by_name(invoice_query_params[:settled], :transaction_id)
        ]}
      elsif key === :past_due
        query = query_existance_by_name(invoice_query_params[:past_due], :due_date)
      elsif bool_params.include?(key)
        query = query_bool_by_name(invoice_query_params[key], key)
      elsif array_params.include?(key)
        query = query_array_by_name(invoice_query_params[key], key)
      elsif exist_params.include?(key)
        query = query_existance_by_name(invoice_query_params[key], key)
      end

      build_query(query)
    end

    invoices = @queries.length > 0 ? Invoice.where(@queries.reduce(&:merge)) : Invoice.all
    invoices = query_resource(invoices) # Query with the usual sorting, paging and searching

    return render_with_total_items(invoices, { each_serializer: InvoiceSerializer, root: "invoices" })
  end

  def create
    if params['invoice_option']
      raise ActionController::ParameterMissing.new(:id) if invoice_option_params[:id].nil?
      raise ActionController::ParameterMissing.new(:member_id) if invoice_option_params[:member_id].nil?
      member = Member.find(invoice_option_params[:member_id])
      raise ::Mongoid::Errors::DocumentNotFound.new(Member, { id: invoice_option_params[:member_id] }) if member.nil?
      invoice_option = InvoiceOption.find(invoice_option_params[:id])
      raise ::Mongoid::Errors::DocumentNotFound.new(InvoiceOption, { id: invoice_option_params[:id] }) if invoice_option.nil?
      if (invoice_option_params[:discount_id])
        discounts = ::BraintreeService::Discount.get_discounts(@gateway)
        invoice_discount = discounts.find { |d| d.id == invoice_option_params[:discount_id]}
      end
      invoice = invoice_option.build_invoice(member.id, Time.now, invoice_option_params[:resource_id], invoice_discount)

    else
      invoice = Invoice.new(invoice_params)
      invoice.save!
    end

    render json: invoice and return
  end

  def update
    # TODO this should be handled by the model not controller
    if !!invoice_params[:settled] && !@invoice.settled
      @invoice.settle_invoice
    else
      @invoice.update_attributes!(invoice_params)
    end
    render json: @invoice and return
  end

  def destroy
    @invoice.destroy
    render json: {}, status: 204 and return
  end

  private
  def invoice_params
    params.require(:invoice).permit(:description,
                                    :items,
                                    :settled,
                                    :amount,
                                    :quantity,
                                    :payment_type,
                                    :resource_id,
                                    :resource_class,
                                    :due_date,
                                    :member_id)
  end

  def invoice_option_params
    params.require(:invoice_option).permit(:id, :discount_id, :member_id, :resource_id)
  end

  def find_invoice
    @invoice = Invoice.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { id: params[:id] }) if @invoice.nil?
  end

  def invoice_query_params
    params.permit(:settled, :past_due, :refunded, :refund_requested, :plan_id => [], :resource_class => [], :resource_id => [], :member_id => [])
  end

  def bool_params
    [:refunded]
  end

  def array_params
    [:resource_class, :resource_id, :member_id, :plan_id]
  end

  def exist_params
    [:refund_requested]
  end

  def build_query(query)
    query || {}
  end
end