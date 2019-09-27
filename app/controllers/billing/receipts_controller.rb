class Billing::ReceiptsController < BillingController
  before_action :verify_customer

  def show
    @invoice = Invoice.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Invoice, { id: params[:id] }) if @invoice.nil?
    raise ::Error::NotFound.new() if @invoice.transaction_id.nil?
    @transaction = ::BraintreeService::Transaction.get_transaction(@gateway, @invoice.transaction_id)
    @member = @invoice.member
    @subscription = @transaction.subscription_details unless @transaction.subscription_id.nil?
    @payment_method = @transaction.payment_method
    get_profile_url()
    render layout: false
  end

  private
  def get_profile_url()
    @url = url_for(action: :application, controller: "/application")
    @url += "members/#{@member.id}"
  end

  def verify_customer
    raise Error::Braintree::MissingCustomer.new unless current_member.customer_id
  end
end