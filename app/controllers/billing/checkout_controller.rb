class Billing::CheckoutController < ApplicationController
    include BraintreeGateway
    before_action :checkout_params, only: [:create]

    def new
      client_token = generate_client_token
      render json: { client_token: client_token } and return
    end

    def create
      if checkout_params[:payment_method_id].nil?
        render json: {error: "Payment method required" }, status: 400 and return
      end
      begin
        @payment_method = verify_token
      rescue Braintree::NotFoundError => e
        render json: {error: e.message }, status: 500 and return
      rescue ArgumentError => e
        render json: {error: e.message }, status: 500 and return
      end
      invoices = Invoice.any_in(id: checkout_params[:invoice_ids] )
      results = settle_invoices(invoices)
      byebug
      # TODO Email user a receipt
      if results.all?(&:success?)
        render json: { }, status: 200 and return
      else
        error = results.errors.map { |e| e.message }
        render json: {error: error }, status: 500 and return
      end
    end

    private
    def generate_client_token
      return @gateway.client_token.generate
    end

    def verify_token
      if current_member.customer_id.nil?
        # TODO: Figure out guest checkout process
      else
        payment_method = ::BraintreeService::PaymentMethod.find_payment_method_for_customer(@gateway, checkout_params[:payment_method_id], current_member.customer_id)
      end
    end

    def settle_invoices(invoices)
      single_transactions, new_subscriptions = invoices.partition { |invoice| invoice.plan_id.nil? }
      subscription_results = new_subscriptions.map { |invoice| create_subscription(invoice) } unless new_subscriptions.empty?
      result = submit_transaction(single_transactions) unless single_transactions.empty?
      subscription_results.concat([result])
    end

    def create_subscription(invoice)
      subscription_obj = {
        payment_method_token: checkout_params[:payment_method_id],
        plan_id: invoice.plan_id
      }
      if invoice.discount_id
        subscription_obj[:discounts] = {
          add: [{ inherited_from_id: invoice.discount_id }]
        }
      end
      result = @gateway.subscription.create(subscription_obj)
      if result.success?
        invoice.update_attribute({ settled_at: Time.now })
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
      result
    end

    def checkout_params
      params.require(:checkout).permit(:payment_method_id, invoice_ids: [])
    end
  end
