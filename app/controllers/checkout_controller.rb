class CheckoutController < ApplicationController
  before_action :init_gateway
  before_action :get_nonce_params, only: [:create]

  def index
    client_token = generate_client_token
    render json: { client_token: client_token } and return
  end

  def create
    checkout = params[:checkout]
    customer_response = create_customer
    if customer_response.success?
      customer = customer_response.customer
      payment_method_response = @gateway.payment_method.create(
        :customer_id => customer.id,
        :payment_method_nonce => checkout[:payment_method_nonce]
      )
      if payment_method_response.success?
        subscription_result = @gateway.subscription.create(
          :payment_method_token => payment_method_response.payment_method.token,
          :plan_id => "j7t2"
        )
        if subscription_result.success?
          render json: {}, status: 200 and return
        else
          error = "failed subscription"
        end
      else
        error = "failed payment method"
      end
    else
      error = "failed customer"
    end
    render json: {error: error}, status: 400 and return
  end

  def get_all_payment_plans
    plans = @gateway.plan.all
    render json: { plans: plans.to_a } and return
  end

  def get_all_subscriptions
    subs = @gateway.subscription.search
    render json: { subs: subs.ids } and return
  end

  private
  def init_gateway
    @gateway = Braintree::Gateway.new(
      :environment => :sandbox,
      :merchant_id => ENV["BT_MERCHANT_ID"],
      :public_key => ENV["BT_PUBLIC_KEY"],
      :private_key => ENV['BT_PRIVATE_KEY'],
    )
  end

  def generate_client_token
    return @gateway.client_token.generate
  end

  def generate_subscriptiono(token, plan_id)
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
    )

  end

  def get_nonce_params
    params.require(:checkout).permit(:payment_method_nonce, :amount, :firstname, :lastname, :email)
  end
end
