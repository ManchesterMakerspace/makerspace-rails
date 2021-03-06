class Admin::InvoicesController < AdminController
  include FastQuery::MongoidQuery
  include BraintreeGateway
  before_action :find_invoice, only: [:update, :destroy]

  def index
    @queries = invoice_query_params.keys.map do |k|
      key = k.to_sym

      if key === :settled
        query = query_to_bool(invoice_query_params[:settled],
          {"$or" => [
            { :settled_at.ne => nil },
            { :transaction_id.ne => nil }
          ]},
          {"$and" => [
            { settled_at: nil },
            { transaction_id: nil }
          ]},
        )
      elsif key === :past_due
        query = query_to_bool(invoice_query_params[:past_due],
          {"$or" => [
            { settled_at: nil },
            { transaction_id: nil }
          ], :due_date.lt => Time.now },
          {"$or" => [
            {"$and" => [
              { :settled_at.ne => nil },
              { :transaction_id.ne => nil }
            ]},
            :due_date.gte => Time.now] }
        )
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

    return render_with_total_items(invoices, { each_serializer: InvoiceSerializer, adapter: :attributes })
  end

  # Create an invoice from an invoice option
  def create
    if params['id']
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
      invoice = Invoice.new(create_invoice_params)
      invoice.save!
    end
    render json: invoice, adapter: :attributes and return
  end

  def update
    if !!update_invoice_params[:settled] && !@invoice.settled
      @invoice.submit_for_settlement(nil, nil, nil)
    else
      @invoice.update_attributes!(update_invoice_params)
    end
    render json: @invoice, adapter: :attributes and return
  end

  def destroy
    @invoice.destroy
    render json: {}, status: 204 and return
  end

  private
  def update_invoice_params
    params.permit(:description,
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

  def create_invoice_params
    params.require([:amount, :quantity, :resource_id, :resource_class, :member_id])
    update_invoice_params
  end

  def invoice_option_params
    params.require([:id, :member_id, :resource_id])
    params.permit(:id, :discount_id, :member_id, :resource_id)
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