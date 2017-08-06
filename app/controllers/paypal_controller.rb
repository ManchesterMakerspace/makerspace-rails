class PaypalController < ApplicationController
protect_from_forgery except: [:notify]
  def notify
    @api = Paypal::SDK::Merchant.new
    if @api.ipn_valid?(request.raw_post)
      puts request
    end
  end
end
