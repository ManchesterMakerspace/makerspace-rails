class BraintreeController < ApplicationController
  include BraintreeGateway
  include Service::SlackConnector
  before_action :validate_notification

  def webhooks
    if @notification.kind == ::Braintree::WebhookNotification::Kind::Check
      send_slack_message("Braintree Webhook test notification succeeded!")
    else
      ::BraintreeService::Notification.process(@gateway, @notification)
    end
    return 200
  end

  private
  def validate_notification
    @notification = @gateway.webhook_notification.parse(params[:bt_signature], params[:bt_payload])
  end
end