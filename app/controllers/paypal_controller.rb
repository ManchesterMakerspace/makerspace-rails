class PaypalController < ApplicationController
  protect_from_forgery except: [:notify]
  before_action :slack_connect, only: [:notify]
  before_action :build_payment, only: [:notify]

  def notify
    @api = PayPal::SDK::Merchant.new

    @notifier.ping("$#{@payment.amount} for #{@payment.product} from #{@payment.firstname} #{@payment.lastname} ~ email:#{@payment.payer_email} <- contact them for card access if they are new")
    if @api.ipn_valid?(request.raw_post)
      #do something
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
    @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
  end
end
