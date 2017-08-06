class PaypalController < ApplicationController
  protect_from_forgery except: [:notify]
  before_action :slack_connect, only: [:notify]

  def notify
    @api = Paypal::SDK::Merchant.new
    if @api.ipn_valid?(request.raw_post)
      
      puts request
      #do something
    end
  end

  private
  def slack_connect
    @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
  end
end
