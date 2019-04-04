class Billing::TransactionsController < BillingController
    include BraintreeGateway
    before_action :transaction_params, only: [:create]

    def create
      raise Error::Braintree::MissingCustomer.new unless current_member.customer_id
      raise ActionController::ParameterMissing.new(:payment_method_id) if transaction_params[:payment_method_id].nil?
      verify_payment_method

      invoice = Invoice.find(transaction_params[:invoice_id])
      raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { id: transaction_params[:id] }) if invoice.nil?

      result = invoice.settle_invoice(@gateway, transaction_params[:payment_method_id])
      raise Error::Braintree::Result.new(result) unless result.success?
      # TODO Email user a receipt

      render json: { }, status: 200 and return
    end

    def request_refund
      # Can only request refund for own invoices
      invoice = Invoice.find_by(id: params[:id], :settled_at.nin => ["", nil])
      raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { id: params[:id] }) if invoice.nil?
      raise Error::Unauthorized.new unless invoice.member.id == current_member.id

      description = invoice.name || invoice.description
      @messages.push("#{current_member.fullname} has requested a refund of #{invoice.amount} for #{description} from #{invoice.settled_at}. <#{ActionMailer::Base.default_url_options[:host]}/billing/transactions/#{invoice.transaction_id}|Process refund>")
    end

    private
    def verify_payment_method
      ::BraintreeService::PaymentMethod.find_payment_method_for_customer(@gateway, transaction_params[:payment_method_id], current_member.customer_id)
    end

    def transaction_params
      params.require(:transaction).permit(:payment_method_id, :invoice_id)
    end
  end
