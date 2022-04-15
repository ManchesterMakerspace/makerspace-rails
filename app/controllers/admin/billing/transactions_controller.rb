class Admin::Billing::TransactionsController < Admin::BillingController
  def index
    transactions = ::BraintreeService::Transaction.get_transactions(@gateway, construct_query)
    
    if transaction_query_params[:discount_id]
      transactions = transactions.filter do |transaction|
        transaction.discounts.find { |discount| discount.id === transaction_query_params[:discount_id] }
      end
    end
    
    return render_with_total_items(transactions, { each_serializer: BraintreeService::TransactionSerializer, adapter: :attributes })
  end

  def show
    transaction = ::BraintreeService::Transaction.get_transaction(@gateway, params[:id])
    render json: transaction, serializer: BraintreeService::TransactionSerializer, adapter: :attributes and return
  end

  def destroy
    ::BraintreeService::Transaction.refund(@gateway, params[:id])
    render json: {}, status: 204 and return
  end

  private
  def construct_query
    Proc.new do |search|
      unless transaction_query_params[:customer_id].nil?
        member = Member.find_by(customer_id: transaction_query_params[:customer_id])
        if member && member.customer_id
          search.customer_id.is(member.customer_id)
        end
      end

      if (transaction_query_params[:end_date] && transaction_query_params[:start_date])
        search.created_at.between(transaction_query_params[:start_date], transaction_query_params[:end_date])
      elsif transaction_query_params[:start_date]
        search.created_at >= transaction_query_params[:start_date]
      elsif transaction_query_params[:end_date]
        search.created_at <= transaction_query_params[:end_date]
      end

      if transaction_query_params[:refund]
        if transaction_query_params[:type].nil?
          raise ::Error::UnprocessableEntity.new("Type required with refund search")
        else
          search.refund.is(transaction_query_params[:refund])
        end
      end

      search.type.is(transaction_query_params[:type]) unless transaction_query_params[:type].nil?

      query_array(transaction_query_params[:transaction_status], search.status) unless transaction_query_params[:transaction_status].nil?
    end
  end

  def transaction_query_params
    params.permit(:start_date, :end_date, :refund, :type, :customer_id, :discount_id, :transaction_status => [])
  end
end