class Billing::CheckoutController < ApplicationController
    include BraintreeGateway
    before_action :checkout_params, only: [:create]
  
    def new
      client_token = generate_client_token
      render json: { client_token: client_token } and return
    end
  
    def create
      checkout = params[:checkout]
      customer_response = create_customer
      if customer_response.success?
        customer = customer_response.customer
        payment_token = customer.payment_methods.first.token
        subscription_result = create_subscription(payment_token, params[:plan_id])
        if subscription_result.success?
          render json: {}, status: 200 and return
        else
          error = "failed subscription"
        end
      else
        error = "failed customer"
      end
      render json: {error: error}, status: 400 and return
    end
  
    private
    def generate_client_token
      return @gateway.client_token.generate
    end
  
    def create_subscription(token, plan_id)
      @gateway.subscription.create(
        :payment_method_token => token,
        :plan_id => plan_id
      )
    end
  
    def create_customer
      checkout = params[:checkout]
      result = @gateway.customer.create(
        :first_name => checkout[:firstname],
        :last_name => checkout[:lastname],
        :payment_method_nonce => checkout[:payment_method_nonce]
      )
    end

    def checkout_params
      params.require(:checkout).permit(:payment_method_nonce, :amount, :firstname, :lastname, :email)
    end
  end
  