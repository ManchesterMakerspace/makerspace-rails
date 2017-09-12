class PaypalController < ApplicationController
  protect_from_forgery except: [:notify]
  before_action :slack_connect, only: [:notify]
  before_action :build_payment, only: [:notify]

  def notify
    @api = PayPal::SDK::Merchant.new
    if @api.ipn_valid?(request.raw_post)
      @notifier.ping("$#{@payment.amount} for #{@payment.product} from #{@payment.firstname} #{@payment.lastname} ~ email: #{@payment.payer_email}")
      if @payment.find_member
        msg = "Member found: #{@payment.member.fullname}. <a href='https://makerspace-interface.herokuapp.com/#/memberships/renew/#{@payment.member.id}'>Renew Member</a>"
        @notifier.ping(Slack::Notifier::Util::LinkFormatter.format(msg))
      else
        msg = "No member found. <a href='https://makerspace-interface.herokuapp.com/#/memberships/invite/#{@payments.payer_email}'>Send registration email to #{@payer.payer_email}</a>"
        @notifier.ping(Slack::Notifier::Util::LinkFormatter.format(msg))
      end
      # if @payment.find_member
      #   #renew some peeps
      # else
      #   token = RegistrationToken.new(email: @payment.payer_email)
      #   if token.save
      #     @notifier.ping("Registration email sent to #{@payment.payer_email}.")
      #     render json: {status: 200}, status: 200 and return
      #   else
      #     render json: {msg: 'Email already taken'}, status: 400 and return
      #   end
      # end
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
            channel: 'renewals',
            icon_emoji: ':ghost:'
    else
      @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
    end
  end
end
