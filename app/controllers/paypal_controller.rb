class PaypalController < ApplicationController
  protect_from_forgery except: [:notify]
  before_action :build_payment, only: [:notify]

  def notify
    configure_messages
    if Rails.env.production?
      if ::PayPal::SDK::Core::API::IPN.valid?(request.raw_post)
          save_and_notify
      else
        enque_message("Invalid IPN received: $#{@payment.amount} for #{@payment.product} from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}")
      end
    else #dev & test
      save_and_notify
    end
  end

  private
  def build_payment
    @payment = Payment.new(
      product: "#{params['item_name']} #{params['item_number']}".strip,
      firstname: params["first_name"],
      lastname: params["last_name"],
      amount: params["mc_gross"],
      currency: params["mc_currency"],
      status: params["payment_status"],
      payment_date: params["payment_date"] || Date.today,
      payer_email: params["payer_email"],
      address: "Not Provided",
      txn_id: params["txn_id"],
      txn_type: params["txn_type"],
      plan_id: params[:recurring_payment_id] || params[:mp_id]
    )

    if(@payment.product == '')
      @payment.product =  "#{params['item_name1']} #{params['item_number1']}"
    end
    if(params["address_city"] && params["address_street"])
      @payment.address = "#{params['address_fullname']}, #{params['address_city']}, #{params['address_state']} #{params['address_zip']}, #{params['address_country_code']}"
    end
  end

  def save_and_notify
    unless @payment.save
      enque_message("Error saving payment: $#{@payment.amount} for #{@payment.product} from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}")
      enque_message("Messages related to error: ")
      @payment.errors.full_messages.each { |msg| enque_message(msg) }
    end
  end

  def configure_messages
    # Check both ID params to try and automate cancelation
    if @payment.plan_id
      matching_invoice = Invoice.find_by(subscription_id: @payment.plan_id)
    end

    base_url = ActionMailer::Base.default_url_options[:host]
    if @payment.member
        completed_message = "Payment Completed: $#{@payment.amount} for #{@payment.product} from  #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email} - Member found: #{@payment.member.fullname}. <#{base_url}/members/#{@payment.member.id}|Renew Member>"
        failed_message = "Error completing payment: $#{@payment.amount} for #{@payment.product} from from  #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email} - Member found: #{@payment.member.fullname}"
    else
        completed_message = "Payment Completed: $#{@payment.amount} for #{@payment.product} from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}. No member found. <#{base_url}/send-registration/#{@payment.payer_email}|Send registration email to #{@payment.payer_email}>"
        failed_message = "Error completing payment: $#{@payment.amount} for #{@payment.product} from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}. No member found. <mailto:#{@payment.payer_email}|Contact #{@payment.payer_email}>"
    end

    case @payment.txn_type
    when 'subscr_signup'
        enque_message("New Subscription sign up from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}")
    when 'subscr_payment'
        enque_message("Subscription payment - " + completed_message)
    when 'subscr_eot' || 'subscr_cancel'
        enque_message("#{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email} has canceled their subscription")
    when 'subscr_failed'
        enque_message("Failed subscription payment - " + failed_message)
    when 'subscr_cancel'
        enque_message("#{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email} has canceled their subscription")
    when 'cart'
        msg = "Standard payment - "
        msg += (@payment.status == 'Completed') ? completed_message : failed_message
        enque_message(msg)
    when 'web_accept', 'send_money'
        msg = "Custom payment - "
        msg += (@payment.status == 'Completed') ? completed_message : failed_message
        enque_message(msg)
    when 'mp_signup'
      enque_message(
        "Paypal registration from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}",
        ::Service::SlackConnector.treasurer_channel
      )
    when 'merch_pmt'
      # Recurring payment
      enque_message(
        "Recurring payment received from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}. If received Braintree notification, no action necessary.",
        ::Service::SlackConnector.treasurer_channel
      )
    when 'mp_cancel'
      unless matching_invoice.nil?
        Invoice.process_cancellation(matching_invoice.id)
        return
      end

      # Couldn't parse or find subscription for this notfication
      # Needs to be cancelled manually
      enque_message(
        "Subscription cancelation received from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}.
         Unable to determine related subscription. Payments have stopped but subscription must be cancelled manually to sync Makerspace software. <#{base_url}/billing|Search and cancel subscriptions>",
      )
    when 'recurring_payment_suspended_due_to_max_failed_payment'
      enque_message(
        "Subscription for #{@payment.firstname} #{@payment.lastname} reached max failed attempts and has been suspended. Subscription can be retried in the Braintree control panel, or member may select a new membership/rental option"
      )

      if matching_invoice
        slack_user = SlackUser.find_by(member_id: matching_invoice.member.id)
        unless slack_user.nil?
          enque_message(
            "Subscription for #{matching_invoice.name} reached max failed attempts and has been suspended. Please review your payment options and contact an administrator to enable.",
            slack_user.slack_id
          )
          Invoice.process_cancellation(matching_invoice.id, true)
        end
      end
    else
        enque_message("Unknown transaction type (#{@payment.txn_type}) from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}.  Details: $#{@payment.amount} for #{@payment.product}. Status: #{@payment.status}")
    end
  end
end
