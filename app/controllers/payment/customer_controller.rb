class Payment::CustomerController < ApplicationController
  include BraintreeGateway
  before_action :checkout_params, only: [:create]

  def create
    checkout = params[:checkout]
    customer_response = create_customer
    if customer_response.success?
      render json: customer_response, status: 200 and return
    else
      error = "failed customer"
    end
    render json: {error: error}, status: 400 and return
  end

  private
  def create_customer
    checkout = params[:checkout]
    result = @gateway.customer.create(
      :first_name => checkout[:firstname],
      :last_name => checkout[:lastname],
      :payment_method_nonce => checkout[:payment_method_nonce]
    )
  end

  def customer_params
    params.require(:customer).permit(:payment_method_nonce, :firstname, :lastname, :email)
  end
end
