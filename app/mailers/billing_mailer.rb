class BillingMailer < ApplicationMailer
  attr_accessor :email, :resource

  default from: 'contact@manchestermakerspace.org'

  def new_subscription(email, subscription, invoice)
    @subscription = subscription
    @invoice = invoice
    send_mail(email, "Welcome to Manchester Makerspace!")
  end

  def receipt(email, transaction, invoice)
    @transaction = transaction
    @invoice = invoice
    send_mail(email, "Receipt from Manchester Makerspace")
  end

  def refund(email, transaction, invoice)
    @transaction = transaction
    @invoice = invoice
    send_mail(email, "Refund Approved")
  end

  def refund_requested(email, transaction, invoice)
    @transaction = transaction
    @invoice = invoice
    send_mail(email, "Refund Requested")
  end

  private
  def get_email(email)
    Rails.env.production? && ENV['BT_ENV'].to_sym == :production ? email : 'test@manchestermakerspace.org'
  end

  def send_mail(email, subject)
    mail to: get_email(email), subject: subject
  end
end
