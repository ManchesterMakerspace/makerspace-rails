class Billing::TransactionsController < BillingController
    include SlackService
    before_action :transaction_params, only: [:create]
    before_action :verify_customer

    def create
      if transaction_params[:invoice_id] && transaction_params[:invoice_option_id]
        raise ::Error::UnprocessableEntity.new("Cannot create transaction from invoice and invoice option") 
      elsif transaction_params[:invoice_id].nil? && transaction_params[:invoice_option_id].nil?
        raise ActionController::ParameterMissing.new(:invoice_id)
      end
      
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

      # Lock invoice so any notifications from settlement dont duplicate settlement operations
      begin
        invoice.lock
        # Handling actual payment & related error handling is abstracted from this controller
        transaction = invoice.submit_for_settlement(@gateway, transaction_params[:payment_method_id])
        invoice.unlock
      # Catch any errors, unlock invoice and then rethrow
      rescue StandardError => e
        invoice.unlock 
        raise
      end

      render json: transaction, serializer: BraintreeService::TransactionSerializer, adapter: :attributes, status: 200 and return
    end

    def index
      # Can only view transactions for your own invoices
      # Transactions & Invoices are stored on different servers so we need to pull both in
      transactions = ::BraintreeService::Transaction.get_transactions(@gateway, construct_query)

      return render_with_total_items(transactions, { each_serializer: BraintreeService::TransactionSerializer, adapter: :attributes })
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
      params.require(:payment_method_id)
      params.permit(:payment_method_id, :invoice_id, :invoice_option_id, :discount_id)
    end

    def construct_query
      Proc.new do |search|
        search.customer_id.is(current_member.customer_id)

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
        query_array(transaction_query_params[:payment_method_token], search.payment_method_token) unless transaction_query_params[:payment_method_token].nil?
      end
    end

    def transaction_query_params
      params.permit(:start_date, :end_date, :refund, :type, :transaction_status => [], :payment_method_token => [])
    end
  end
