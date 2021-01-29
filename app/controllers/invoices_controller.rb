class InvoicesController < AuthenticationController
  include FastQuery::MongoidQuery
  include BraintreeGateway

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

    invoices =  Invoice.where(member_id: current_member.id)

    invoices = @queries.length > 0 ? invoices.where(@queries.reduce(&:merge)) : invoices
    invoices = query_resource(invoices) # Query with the usual sorting, paging and searching

    return render_with_total_items(invoices, { each_serializer: InvoiceSerializer, adapter: :attributes })
  end

  def create
    invoice_option = InvoiceOption.find(invoice_option_params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(InvoiceOption, { id: invoice_option_params[:id] }) if invoice_option.nil?
    if (invoice_option_params[:discount_id])
      discounts = ::BraintreeService::Discount.get_discounts(@gateway)
      invoice_discount = discounts.find { |d| d.id == invoice_option_params[:discount_id]}
    end

    @invoice = invoice_option.build_invoice(current_member.id, Time.now, current_member.id, invoice_discount)
    render json: @invoice, adapter: :attributes and return
  end


  private
  def invoice_option_params
    params.require(:id)
    params.permit(:id, :discount_id)
  end

  def invoice_query_params
    params.permit(:settled, :past_due, :refunded, :refund_requested, :plan_id => [], :resource_class => [], :resource_id => [])
  end

  def bool_params
    [:refunded]
  end

  def array_params
    [:resource_class, :resource_id, :plan_id]
  end

  def exist_params
    [:refund_requested]
  end

  def build_query(query)
    query || {}
  end
end