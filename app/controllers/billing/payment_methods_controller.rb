class Billing::PaymentMethodsController < BillingController
  include BraintreeGateway
  before_action :payment_method_params, only: [:create]

  def new
    client_token = generate_client_token
    # TODO: why isn't this converting to camel case for me
    render json: { clientToken: client_token } and return
  end

  def create
    payment_method_nonce = payment_method_params[:payment_method_nonce]

    # Make sure params are valid
    raise ::ActionController::ParameterMissing.new(:payment_method_nonce) if payment_method_nonce.nil? || payment_method_nonce.empty?

    # Create a member w/ this payment method if not a customer yet
    if current_member.customer_id.nil?
      result = @gateway.customer.create(
        first_name: current_member.firstname,
        last_name: current_member.lastname,
        payment_method_nonce: payment_method_nonce,
      )
      current_member.update_attributes!({ customer_id: result.customer.id }) if result.success?

    # Add this payment method to customer if already customer
    else
      result = @gateway.payment_method.create(
        customer_id: current_member.customer_id,
        payment_method_nonce: payment_method_nonce,
        options: {
          fail_on_duplicate_payment_method: Rails.env.production? && braintree_production?,
          make_default: payment_method_params[:make_default] || false
        }
      )
    end

    # Parse Braintree result
    raise Error::Braintree::Result.new(result) unless result.success?
    payment_method = result.try(:payment_method) ? result.payment_method : result.customer.payment_methods.first

    render json: payment_method, serializer: BraintreeService::PaymentMethodSerializer, root: "payment_method", status: 200 and return
  end

  def index
    if current_member.customer_id.nil?
      payment_methods = []
    else
      payment_methods = ::BraintreeService::PaymentMethod.get_payment_methods_for_customer(@gateway, current_member.customer_id)
    end
    render json: payment_methods, each_serializer: BraintreeService::PaymentMethodSerializer, status: 200, root: :payment_methods and return
  end

  def destroy
    payment_method_token = params[:id]
    raise Error::Braintree::MissingCustomer.new unless current_member.customer_id
    # Only allowed to modify own payment methods
    payment_method = ::BraintreeService::PaymentMethod.find_payment_method_for_customer(@gateway, payment_method_token, current_member.customer_id)
    result = ::BraintreeService::PaymentMethod.delete_payment_method(@gateway, payment_method.token)
    raise Error::Braintree::Result.new(result) unless result.success?
    render json: {}, status: 204 and return
  end

  private
  def payment_method_params
    params.require(:payment_method).permit(:payment_method_nonce, :make_default)
  end

  def generate_client_token
    @gateway.client_token.generate
  end
end
