require 'rails_helper'

RSpec.describe Billing::BraintreeController, type: :controller do
  let(:subscription) { build(:subscription) }
  let(:incoming_subscription_notification) { double(kind: ::Braintree::WebhookNotification::Kind::SubscriptionChargedSuccessfully, subscription: subscription, timestamp: Time.now) }
  let(:gateway) { double }

  let(:valid_params) {
    { 
      bt_signature: "foo",
      bt_payload: JSON.generate(incoming_subscription_notification)
    }
  }

  before(:each) do 
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
  end

  describe "POST #webhooks" do
    it "validates and processes notification" do 
      expect(gateway).to receive_message_chain(:webhook_notification, :parse).and_return(incoming_subscription_notification)
      allow(BraintreeService::Notification).to receive(:process).with(incoming_subscription_notification)
      expect(BraintreeService::Notification).to receive(:process).with(incoming_subscription_notification)
      post :webhooks, params: valid_params, format: :json
    end
  end
end
