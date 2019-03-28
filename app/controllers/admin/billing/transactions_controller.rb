class Admin::Billing::TransactionsController < Admin::BillingController
  include FastQuery
  include BraintreeGateway

  def index
    search_by = transactions_params[:search_by]
    search_id = transactions_params[:search_id]
    if search_by && search_id

      # Get transactions for specific member
      if search_by == "member"
        member = Member.find(search_id)
        raise ::Mongoid::Errors::DocumentNotFound.new(Member, { id: search_id }) if member.nil?
        raise Error::Braintree::MissingCustomer.new unless member.customer_id
        transactions = ::BraintreeService::Transaction.get_transactions(@gateway, { customerId: member.customer_id })

      # Get transactions for subscription
      elsif search_by == "subscription"
        transactions = ::BraintreeService::Subscription.get_subscription(@gateway, search_id).transactions
      end

    # Get list of all transactions
    else
      transactions = ::BraintreeService::Transaction.get_transactions(@gateway)
    end

    return render_with_total_items(transactions, { :each_serializer => Braintree::TransactionSerializer, root: "transactions" })
  end

  def show
    transaction = ::BraintreeService::Transaction.get_transaction(@gateway, params[:id])
    render json: transaction and return
  end

  def destroy
    invoice = Invoice.find_by(transaction_id: params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { id: params[:id] }) if invoice.nil?
    result = ::BraintreeService::Transaction.refund(@gateway, params[:id])
    raise ::Error::Braintree::Result.new(result) unless result.success?

    BillingMailer.refund(email, result.transaction, invoice).deliver_later
    @messages.push("#{invoice.member.fullname}'s refund of #{invoice.amount} for #{invoice.name} from #{invoice.settled_at} completed.")
    render json: {}, status: 204 and return
  end

  private
  def transactions_params
    params.permit(:search_by, :search_id)
  end
end