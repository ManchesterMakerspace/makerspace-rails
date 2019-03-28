class Billing::TransactionsController < BillingController
    include BraintreeGateway
    before_action :transaction_params, only: [:create]

    def create
      raise Error::Braintree::MissingCustomer.new unless current_member.customer_id
      raise ActionController::ParameterMissing.new(:payment_method_id) if transaction_params[:payment_method_id].nil?
      verify_payment_method

      invoice = Invoice.find(transaction_params[:invoice_id])
      raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { id: transaction_params[:invoice_id] }) if invoice.nil?

      transaction = invoice.submit_for_settlement(@gateway, transaction_params[:payment_method_id])
      raise Error::Braintree::Result.new(transaction_result) unless transaction_result.success?

      @messages.push("Payment from #{invoice.member.fullname} of $#{invoice.amount} received for #{invoice.name}")
      BillingMailer.receipt(invoice.member.email, transaction, invoice).deliver_later
      render json: { }, status: 200 and return
    end

    def request_refund
      # Can only request refund for own invoices
      invoice = Invoice.find_by(id: params[:id], :settled_at.nin => ["", nil])
      raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { id: params[:id] }) if invoice.nil?
      raise Error::Unauthorized.new unless invoice.member.id == current_member.id

      description = invoice.name || invoice.description
      transaction = ::BraintreeService::Transaction.get_transaction(@gateway, invoice.transaction_id)
      @messages.push("#{current_member.fullname} has requested a refund of #{invoice.amount} for #{description} from #{invoice.settled_at}. <#{request.base_url}/billing/transactions/#{invoice.transaction_id}|Process refund>")
      BillingMailer.refund_requested(invoice.member.email, transaction).deliver_later
    end

    private
    def verify_payment_method
      ::BraintreeService::PaymentMethod.find_payment_method_for_customer(@gateway, transaction_params[:payment_method_id], current_member.customer_id)
    end

    def transaction_params
      params.require(:transaction).permit(:payment_method_id, :invoice_id)
    end
  end
