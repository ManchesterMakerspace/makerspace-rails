class BillingMailer < ApplicationMailer
  include Service::BraintreeGateway

  attr_accessor :email, :resource

  def new_subscription(email, subscription_id, invoice_id)
    gateway = connect_gateway
    member = Member.find_by(email: email)
    subscription = BraintreeService::Subscription.get_subscription(gateway, subscription_id)
    payment_method = ::BraintreeService::PaymentMethod.find_payment_method_for_customer(gateway, subscription.payment_method_token, member.customer_id)
    invoice = Invoice.find(invoice_id)
    _new_subscription(member, subscription, invoice, payment_method)
  end

  def _new_subscription(member, subscription, invoice, payment_method)
    @member = member
    @subscription = subscription
    @payment_method = payment_method
    @invoice = invoice
    send_mail(member.email, "Subscription to Manchester Makerspace", __method__.to_s)
  end

  def receipt(email, transaction_id, invoice_id)
    transaction = BraintreeService::Transaction.get_transaction(connect_gateway, transaction_id)
    invoice = Invoice.find(invoice_id)
    member = Member.find_by(email: email)
    subscription, payment_method = get_details_from_transaction(transaction)
    _receipt(member, transaction, invoice, subscription, payment_method)
  end

  def _receipt(member, transaction, invoice, subscription, payment_method)
    @subscription = subscription
    @payment_method = payment_method
    @transaction = transaction
    @invoice = invoice
    @member = member
    send_mail(member.email, "Receipt from Manchester Makerspace", __method__.to_s)
  end

  def refund(email, transaction_id, invoice_id)
    transaction = BraintreeService::Transaction.get_transaction(connect_gateway, transaction_id)
    invoice = Invoice.find(invoice_id)
    member = Member.find_by(email: email)
    subscription, payment_method = get_details_from_transaction(transaction)
    _refund(member, transaction, invoice, subscription, payment_method)
  end

  def _refund(member, transaction, invoice, subscription, payment_method)
    @transaction = transaction
    @invoice = invoice
    @subscription = subscription
    @payment_method = payment_method
    @member = member
    send_mail(member.email, "Refund Approved for transaction #{@transaction.id}", __method__.to_s)
  end

  def refund_requested(email, transaction_id, invoice_id)
    transaction = BraintreeService::Transaction.get_transaction(connect_gateway, transaction_id)
    invoice = Invoice.find(invoice_id)
    member = Member.find_by(email: email)
    subscription, payment_method = get_details_from_transaction(transaction)
    _refund_requested(member, transaction, invoice, subscription, payment_method)
  end

  def _refund_requested(member, transaction, invoice, subscription, payment_method)
    @transaction = transaction
    @invoice = invoice
    @subscription = subscription
    @payment_method = payment_method
    @member = member
    send_mail(member.email, "Refund Requested for transaction #{@transaction.id}", __method__.to_s)
  end

  def canceled_subscription(email, invoice_resource_class)
    member = Member.find_by(email: email)
    _canceled_subscription(member, invoice_resource_class)
  end

  def _canceled_subscription(member, invoice_resource_class)
    @member = member
    @type = invoice_resource_class
    send_mail(member.email, "Canceled Manchester Makerspace Subscription", __method__.to_s)
  end

  def failed_payment(email, invoice_id, error_status)
    member = Member.find_by(email: email)
    invoice = Invoice.find(invoice_id)
    _failed_payment(member, invoice, error_status)
  end

  def _failed_payment(member, invoice, error_status)
    @error_status = error_status
    @member = member
    @invoice = invoice
    send_mail(member.email, "Failed payment to Manchester Makerspace", __method__.to_s)
  end

  def dispute_requested(email, invoice_id)
    member = Member.find_by(email: email)
    invoice = Invoice.find(invoice_id)
    _dispute_requested(member, invoice)
  end

  def _dispute_requested(member, invoice)
    @member = member
    @invoice = invoice
    send_mail(member.email, "Dispute opened for payment to Manchester Makerspace", __method__.to_s)
  end

  def dispute_won(email, invoice_id)
    member = Member.find_by(email: email)
    invoice = Invoice.find(invoice_id)
    _dispute_won(member, invoice)
  end

  def _dispute_won(member, invoice)
    @member = member
    @invoice = invoice
    send_mail(member.email, "Dispute won for payment to Manchester Makerspace", __method__.to_s)
  end

  def dispute_lost(email, invoice_id)
    member = Member.find_by(email: email)
    invoice = Invoice.find(invoice_id)
    _dispute_lost(member, invoice)
  end

  def _dispute_lost(member, invoice)
    @member = member
    @invoice = invoice
    send_mail(member.email, "Dispute lost for payment to Manchester Makerspace", __method__.to_s)
  end

  def new_invoice(email, invoice_id)
    member = Member.find_by(email: email)
    invoice = Invoice.find(invoice_id)
    _new_invoice(member, invoice)
  end

  def _new_invoice(member, invoice)
    @member = member
    @invoice = invoice
    send_mail(member.email, "Makerspace dues require your attention", __method__.to_s)
  end

  private
  def send_mail(email, subject, calling_method)
    get_profile_url()
    mail to: email, subject: subject, template_name: calling_method.delete_prefix("_")
  end

  def get_profile_url()
    unless @member.nil? 
      @url = url_for(action: :application, controller: :application)
      @url += "members/#{@member.id}"
    end
  end

  def get_details_from_transaction(transaction)
    subscription = transaction.subscription_details unless transaction.subscription_id.nil?
    payment_method = transaction.payment_method
    [subscription, payment_method]
  end
end
