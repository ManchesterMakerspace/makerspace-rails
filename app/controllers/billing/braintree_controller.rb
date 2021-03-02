class Billing::BraintreeController < ApplicationController
  include BraintreeGateway
  before_action :validate_notification
  protect_from_forgery except: [:webhooks]

  def webhooks
    if @notification.kind == ::Braintree::WebhookNotification::Kind::Check
      enque_message("Braintree Webhook test notification succeeded!")
    else
      ::BraintreeService::Notification.process(@notification)
    end
    render json: { }, status: 200 and return
  end

  private
  def validate_notification
    @notification = @gateway.webhook_notification.parse(params[:bt_signature], params[:bt_payload])
  end
end