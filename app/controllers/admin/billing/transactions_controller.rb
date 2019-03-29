class Admin::Billing::TransactionsController < Admin::BillingController
  include FastQuery
  include BraintreeGateway

  def index
    search_by = transactions_params[:searchBy]
    search_id = transactions_params[:searchId]

    search_query = {}
    search_query[:start_date] = transactions_params[:startDate] unless transactions_params[:startDate].nil?
    search_query[:end_date] = transactions_params[:endDate] unless transactions_params[:endDate].nil?
    if search_by && search_id

      # Get transactions for specific member
      if search_by == "member"
        member = Member.find(search_id)
        raise ::Mongoid::Errors::DocumentNotFound.new(Member, { id: search_id }) if member.nil?
        raise Error::Braintree::MissingCustomer.new unless member.customer_id

        search_query[:customer_id] = member.customer_id

        # Get transactions for subscription
      elsif search_by == "subscription"
        transactions = ::BraintreeService::Subscription.get_subscription(@gateway, search_id).transactions
      else
        transactions = []
      end
    end
    transactions ||= ::BraintreeService::Transaction.get_transactions(@gateway, search_query)

    invoices = Invoice.where(:transaction_id.in => transactions.map(&:id))
    transactions = transactions.collect do |t|
      t.invoice = invoices.detect { |i| i.transaction_id == t.id }
      t
    end

    return render_with_total_items(transactions, { each_serializer: Braintree::TransactionSerializer, root: "transactions" })
  end

  def show
    transaction = ::BraintreeService::Transaction.get_transaction(@gateway, params[:id])
    render json: transaction and return
  end

  def destroy
    invoice = Invoice.find_by(transaction_id: params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { id: params[:id] }) if invoice.nil?
    transaction = ::BraintreeService::Transaction.refund(@gateway, params[:id])
    invoice.reload
    BillingMailer.refund(email, transaction, invoice).deliver_later
    @messages.push("#{invoice.member.fullname}'s refund of #{invoice.amount} for #{invoice.name} from #{invoice.settled_at} completed.")
    render json: {
      transaction: ActiveModel::Serializer.new(transaction, serializer: Braintree::TransactionSerializer),
      invoice: ActiveModel::Serializer.new(invoice, serializer: InvoiceSerializer),
    } and return
  end

  private
  def transactions_params
    params.permit(:searchBy, :searchId, :startDate, :endDate)
  end
end