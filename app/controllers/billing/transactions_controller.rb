class Billing::TransactionsController < BillingController
    include FastQuery
    include SlackService
    before_action :transaction_params, only: [:create]
    before_action :verify_customer

    def create
      if transaction_params[:invoice_id] && transaction_params[:invoice_option_id]
        raise ::Error::UnprocessableEntity.new("Cannot create transaction from invoice and invoice option") 
      elsif transaction_params[:invoice_id].nil? && transaction_params[:invoice_option_id].nil?
        raise ActionController::ParameterMissing.new(:invoice_id)
      end
      
      raise ActionController::ParameterMissing.new(:payment_method_id) if transaction_params[:payment_method_id].nil?
      verify_payment_method

      if transaction_params[:invoice_id]
        invoice = Invoice.find(transaction_params[:invoice_id])
        raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { id: transaction_params[:invoice_id] }) if invoice.nil?
      else 
        invoice_option = InvoiceOption.find(transaction_params[:invoice_option_id])
        raise ::Mongoid::Errors::DocumentNotFound.new(InvoiceOption, { id: transaction_params[:invoice_option_id] }) if invoice_option.nil?
        raise ::Error::UnprocessableEntity.new("Cannot create transaction from rental invoice option") if invoice_option.resource_class == "rental"
        if (transaction_params[:discount_id])
          discounts = ::BraintreeService::Discount.get_discounts(@gateway)
          invoice_discount = discounts.find { |d| d.id == transaction_params[:discount_id]}
          raise ::Error::NotFound.new() if invoice_discount.nil?
        end
        invoice = invoice_option.build_invoice(current_member.id, Time.now, current_member.id, invoice_discount)
      end

      # Handling actual payment & related error handling is abstracted from this controller
      transaction = invoice.submit_for_settlement(@gateway, transaction_params[:payment_method_id])
     
      render json: transaction, serializer: BraintreeService::TransactionSerializer, root: "transaction", status: 200 and return
    end

    def index
      # Can only view transactions for your own invoices
      # Transactions & Invoices are stored on different servers so we need to pull both in
      transactions = ::BraintreeService::Transaction.get_transactions(@gateway, { customer_id: current_member.customer_id })

      return render_with_total_items(transactions, { each_serializer: BraintreeService::TransactionSerializer, root: "transactions" })
    end

    def destroy
      transaction = ::BraintreeService::Transaction.get_transaction(@gateway, params[:id])
      # Can only request refund for own invoices
      invoice = Invoice.find_by(transaction_id: transaction.id, member_id: current_member.id)
      raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { transaction_id: transaction.id }) if invoice.nil?

      description = invoice.name || invoice.description
      invoice.request_refund

      render json: {}, status: 204 and return
    end

    private
    def verify_payment_method
      ::BraintreeService::PaymentMethod.find_payment_method_for_customer(@gateway, transaction_params[:payment_method_id], current_member.customer_id)
    end

    def verify_customer
      raise Error::Braintree::MissingCustomer.new unless current_member.customer_id
    end

    def transaction_params
      params.require(:transaction).permit(:payment_method_id, :invoice_id, :invoice_option_id, :discount_id)
    end
  end
