class PaypalController < ApplicationController
  protect_from_forgery except: [:notify]
  before_action :slack_connect, only: [:notify]
  before_action :build_payment, only: [:notify]

  def notify
    @api = PayPal::SDK::Merchant.new
    configure_messages
    if Rails.env.production?
      if @api.ipn_valid?(request.raw_post)
        save_and_notify
      else
        @notifier.ping("Invalid payment received: $#{@payment.amount} for #{@payment.product} from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}")
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
      txn_type: params["txn_type"]
    )

    if(@payment.product == '')
      @payment.product =  "#{params['item_name1']} #{params['item_number1']}"
    end
    if(params["address_city"] && params["address_street"])
      @payment.address = "#{params['address_fullname']}, #{params['address_city']}, #{params['address_state']} #{params['address_zip']}, #{params['address_country_code']}"
    end
  end

  def slack_connect
    if Rails.env.production?
      @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'members_relations',
            icon_emoji: ':ghost:'
    else
      @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
    end
  end

  def save_and_notify
    if @payment.save
      @messages.each { |msg| @notifier.ping(Slack::Notifier::Util::LinkFormatter.format(msg)) }
    else
      @notifier.ping("Error saving payment: $#{@payment.amount} for #{@payment.product} from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}")
      if @messages.length > 0
          @notifier.ping("Messages related to error: ")
          @messages.each { |msg| @notifier.ping(Slack::Notifier::Util::LinkFormatter.format(msg)) }
      end
    end
  end

  def configure_messages
    @messages = [];

    if @payment.member
        completed_message = "Payment Completed: $#{@payment.amount} for #{@payment.product} from  #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email} - Member found: #{@payment.member.fullname}. <a href='https://makerspace-interface.herokuapp.com/#/memberships/renew/#{@payment.member.id}'>Renew Member</a>"
        failed_message = "Error completing payment: $#{@payment.amount} for #{@payment.product} from from  #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email} - Member found: #{@payment.member.fullname}"
    else
        completed_message = "Payment Completed: $#{@payment.amount} for #{@payment.product} from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}. No member found. <a href='https://makerspace-interface.herokuapp.com/#/memberships/invite/#{@payment.payer_email}'>Send registration email to #{@payment.payer_email}</a>"
        failed_message = "Error completing payment: $#{@payment.amount} for #{@payment.product} from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}. No member found. <a href='mailto:#{@payment.payer_email}'>Contact #{@payment.payer_email}</a>"
    end

    case @payment.txn_type
    when 'subscr_signup'
        @messages.push("New Subscription sign up from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}")
    when 'subscr_payment'
        @messages.push("Subscription payment - " + completed_message)
    when 'subscr_eot' || 'subscr_cancel'
        @messages.push("#{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email} has cancelled their subscription")
    when 'subscr_failed'
        @messages.push("Failed subscription payment - " + failed_message)
    when 'subscr_cancel'
        @messages.push("#{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email} has cancelled their subscription")
    when 'cart'
        msg = "Standard payment - "
        msg += (@payment.status == 'Completed') ? completed_message : failed_message
        @messages.push(msg)
    when 'send_money'
        msg = "Custom payment - "
        msg += (@payment.status == 'Completed') ? completed_message : failed_message
        @messages.push(msg)
    else
        @messages.push("Unknown transaction type (#{@payment.txn_type}) from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}.  Details: $#{@payment.amount} for #{@payment.product}. Status: #{@payment.status}")
    end
  end
end
