class Billing::PaymentMethodsController < ApplicationController
  include BraintreeGateway
  before_action :payment_method_params, only: [:create]

  def create
    response = {
      success: false,
      error: "",
      data: nil
    }
    # Make sure params are valid
    if payment_method_params && payment_method_params[:payment_method_nonce]
      payment_method_nonce = payment_method_params[:payment_method_nonce]

      # Create a member w/ this payment method if not a customer yet
      if current_member.customer_id.nil?
        result = @gateway.customer.create(
          first_name: current_member.firstname,
          last_name: current_member.lastname,
          payment_method_nonce: payment_method_nonce,
        )
        current_member.update_attributes({ customer_id: result.custom.id }) if result.success?
      # Add this payment method to customer
      else
        result = @gateway.payment_method.create(
          customer_id: current_member.customer_id,
          payment_method_nonce: payment_method_nonce,
          options: {
            fail_on_duplicate_payment_method: true,
            make_default: payment_method_params[:make_default] || false
          }
        )
      end

      # Parse Braintree result
      if result.success?
        response[:success] = result.success?
        response[:data] = result.try(:payment_method) ? result.payment_method.token : result.customer.payment_methods[0].token
      else
      response[:error] = result.errors.map { |e| e.message }
      end
    else
      response[:error] = "Invalid payment method"
    end

    if response[:success]
      render json: response[:data], status: 200 and return
    else
      render json: {error: response[:error] }, status: 400 and return
    end
  end

  def index
    if current_member.customer_id.nil?
      @payment_methods = []
    else
      begin
        @payment_methods = ::BraintreeService::PaymentMethod.get_payment_methods_for_customer(@gateway, current_member.customer_id)
      rescue Braintree::NotFoundError
        render json: {error: "Error communicating with Braintree" }, status: 500 and return
      end
    end
    render json: @payment_methods, each_serializer: Braintree::PaymentMethodSerializer, status: 200, root: :payment_methods and return
  end

  private
  def payment_method_params
    params.require(:payment_method).permit(:payment_method_nonce, :make_default)
  end
end
