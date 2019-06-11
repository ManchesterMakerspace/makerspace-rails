class BillingMailer < ApplicationMailer
  include Service::BraintreeGateway

  attr_accessor :email, :resource

  default from: 'contact@manchestermakerspace.org'

  def new_subscription(email, subscription, inv)
    @subscription = subscription
    @invoice = inv 
    @member = Member.find_by(email: email)
    # @subscription = BraintreeService::Subscription.get_subscription(connect_gateway, subscription_id)
    # @invoice = Invoice.find(invoice_id)
    send_mail(email, "Subscription to Manchester Makerspace")
  end

  def receipt(email, transaction_id, invoice_id)
    @invoice = Invoice.find(invoice_id)
    @transaction = BraintreeService::Transaction.get_transaction(connect_gateway, transaction_id)
    send_mail(email, "Receipt from Manchester Makerspace")
  end

  def refund(email, transaction_id, invoice_id)
    @invoice = Invoice.find(invoice_id)
    @transaction = BraintreeService::Transaction.get_transaction(connect_gateway, transaction_id)
    send_mail(email, "Refund Approved for transaction #{@transaction.id}")
  end

  def refund_requested(email, transaction_id, invoice_id)
    @invoice = Invoice.find(invoice_id)
    @transaction = BraintreeService::Transaction.get_transaction(connect_gateway, transaction_id)
    send_mail(email, "Refund Requested for transaction #{@transaction.id}")
  end

  private
  def get_email(email)
    Rails.env.production? && ENV['BT_ENV'].to_sym == :production ? email : 'test@manchestermakerspace.org'
  end

  def send_mail(email, subject)
    mail to: get_email(email), subject: subject
  end
end
