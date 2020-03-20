class BillingMailer < ApplicationMailer
  include Service::BraintreeGateway

  attr_accessor :email, :resource

  default from: 'contact@manchestermakerspace.org'

  def new_subscription(email, subscription_id, invoice_id)
    gateway = connect_gateway
    @member = Member.find_by(email: email)
    @subscription = BraintreeService::Subscription.get_subscription(gateway, subscription_id)
    @payment_method = ::BraintreeService::PaymentMethod.find_payment_method_for_customer(gateway, @subscription.payment_method_token, @member.customer_id)
    @invoice = Invoice.find(invoice_id)
    get_profile_url()
    send_mail(email, "Subscription to Manchester Makerspace")
  end

  def receipt(email, transaction_id, invoice_id)
    @transaction = BraintreeService::Transaction.get_transaction(connect_gateway, transaction_id)
    @invoice = Invoice.find(invoice_id)
    get_details_from_transaction()
    @member = Member.find_by(email: email)
    get_profile_url()
    send_mail(email, "Receipt from Manchester Makerspace")
  end

  def refund(email, transaction_id, invoice_id)
    @transaction = BraintreeService::Transaction.get_transaction(connect_gateway, transaction_id)
    @invoice = Invoice.find(invoice_id)
    get_details_from_transaction()
    @member = Member.find_by(email: email)
    get_profile_url()
    send_mail(email, "Refund Approved for transaction #{@transaction.id}")
  end

  def refund_requested(email, transaction_id, invoice_id)
    @transaction = BraintreeService::Transaction.get_transaction(connect_gateway, transaction_id)
    @invoice = Invoice.find(invoice_id)
    get_details_from_transaction()
    @member = Member.find_by(email: email)
    get_profile_url()
    send_mail(email, "Refund Requested for transaction #{@transaction.id}")
  end

  def canceled_subscription(email, invoice_id)
    @member = Member.find_by(email: email)
    @invoice = Invoice.find(invoice_id)
    get_profile_url()
    send_mail(email, "Canceled Manchester Makerspace Subscription")
  end

  def failed_payment(email, invoice_id, error_status)
    @error_status = error_status
    @member = Member.find_by(email: email)
    @invoice = Invoice.find(invoice_id)
    get_profile_url()
    send_mail(email, "Failed payment to Manchester Makerspace")
  end

  def dispute_requested(email, invoice_id)
    @member = Member.find_by(email: email)
    @invoice = Invoice.find(invoice_id)
    send_mail(email, "Dispute opened for payment to Manchester Makerspace")
  end

  def dispute_won(email, invoice_id)
    @member = Member.find_by(email: email)
    @invoice = Invoice.find(invoice_id)
    send_mail(email, "Dispute won for payment to Manchester Makerspace")
  end

  def dispute_lost(email, invoice_id)
    @member = Member.find_by(email: email)
    @invoice = Invoice.find(invoice_id)
    send_mail(email, "Dispute lost for payment to Manchester Makerspace")
  end

  private
  def send_mail(email, subject)
    mail to: email, subject: subject
  end

  def get_profile_url()
    @url = url_for(action: :application, controller: :application)
    @url += "members/#{@member.id}"
  end

  def get_details_from_transaction
    @subscription = @transaction.subscription_details unless @transaction.subscription_id.nil?
    @payment_method = @transaction.payment_method
  end
end
