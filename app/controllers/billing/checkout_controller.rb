class Billing::CheckoutController < ApplicationController
    include BraintreeGateway
    before_action :checkout_params, only: [:create]

    def new
      client_token = generate_client_token
      render json: { client_token: client_token } and return
    end

    def create
      raise Error::Braintree::MissingCustomer.new unless current_member.customer_id
      raise ActionController::ParameterMissing.new(:payment_method_id) if checkout_params[:payment_method_id].nil?
      @payment_method = verify_token
      invoices = Invoice.any_in(id: checkout_params[:invoice_ids])
      # TODO only allow a subscription to be created or single transactions to be submitted. Doing both confuses the result

      results = settle_invoices(invoices)
      failures = results.select { |r| !r[:result].success? }

      raise Error::Braintree::Result.new(failures) if results.none? { |r| r[:result].success? }
      # TODO Email user a receipt

      # All succeed, were good. Just return 200
      if failures.size == 0
        render json: { }, status: 200 and return

      # Partial succeess.  Need to alert user what failed
      else
        checkout_failures = failures.map { |f| { invoice_ids: f[:invoice_ids], error: get_result_error(f[:result]) }}
        render json: { failures: failures }, status: 200 and return
      end
    end

    private
    def generate_client_token
      return @gateway.client_token.generate
    end

    def verify_token
      payment_method = ::BraintreeService::PaymentMethod.find_payment_method_for_customer(@gateway, checkout_params[:payment_method_id], current_member.customer_id)
    end

    def settle_invoices(invoices)
      single_transactions, new_subscriptions = invoices.partition { |invoice| invoice.plan_id.nil? }
      subscription_results = new_subscriptions.map { |invoice| { invoice_ids: [invoice.id], result: create_subscription(invoice)} } unless new_subscriptions.empty?
      single_transaction_result = submit_transaction(single_transactions) unless single_transactions.empty?

      settlement_results = []
      settlement_results.concat(subscription_results) if subscription_results
      settlement_results.push(single_transaction_result) if single_transaction_result
      settlement_results
    end

    def create_subscription(invoice)
      subscription_obj = {
        payment_method_token: checkout_params[:payment_method_id],
        plan_id: invoice.plan_id,
        id: ::BraintreeService::Subscription.generate_id(invoice)
      }
      if invoice.discount_id
        subscription_obj[:discounts] = {
          add: [{ inherited_from_id: invoice.discount_id }]
        }
      end
      result = @gateway.subscription.create(subscription_obj)
      if result.success?
        invoice.settle_invoice(result)
        invoice.resource.update(subscription_id: result.subscription.id)
      end
      result
    end

    def submit_transaction(invoices)
      line_items = invoices.map do |invoice|
        {
          kind: "debit",
          name: invoice.description,
          quantity: 1,
          total_amount: invoice.amount,
          unit_amount: invoice.amount
        }
      end
      result = @gateway.transaction.sale(
        amount: line_items.inject(0){ |sum,item| sum + item[:total_amount] },
        payment_method_token: checkout_params[:payment_method_id],
        line_items: line_items,
        options: {
          submit_for_settlement: true
        },
      )
      if result.success?
        # Settle invoices in DB
        invoice_settlements = invoices.map { |i| i.settle_invoice(result) }
        if invoice_settlements.any? { |i| !i }
          # TODO: Send email letting us know of failure
        end
        # Generate new ones
        new_invoices = invoices.map { |i| i.build_next_invoice }
        if new_invoices.any? { |i| !i }
          # TODO: Send email letting us know of failure
        end
      end
      { invoice_ids: invoices.map(&:id), result: result }
    end

    def checkout_params
      params.require(:checkout).permit(:payment_method_id, invoice_ids: [])
    end
  end
