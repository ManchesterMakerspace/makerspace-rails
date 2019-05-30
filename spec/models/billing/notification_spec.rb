require 'rails_helper'

RSpec.describe BraintreeService::Notification, type: :model do
  let(:gateway) { double } # Create a fake gateway
  let(:subscription) { build(:subscription) }
  let(:dispute) { build(:dispute) }
  let(:incoming_subscription_notification) { double(kind: ::Braintree::WebhookNotification::Kind::SubscriptionChargedSuccessfully, subscription: subscription, timestamp: Time.now) }
  let(:incoming_dispute_notification) { double(kind: ::Braintree::WebhookNotification::Kind::DisputeOpened, dispute: dispute, timestamp: Time.now) }

  describe "Mongoid validations" do 
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'braintree__notifications') }

    it { is_expected.to have_fields(:kind, :payload).of_type(String) }
    it { is_expected.to have_field(:timestamp).of_type(Date) }
  end 

  it "has a factory" do
    expect(build(:notification)).to be_truthy
  end

  describe "#process" do 
    it "reads notification and stores in db" do 
      expect {
        BraintreeService::Notification.process(incoming_subscription_notification).to change(BraintreeService::Notification, :count).by(1)
      }

      serialized_subscription = BraintreeService::SubscriptionSerializer.new(incoming_subscription_notification.subscription)
      allow(incoming_subscription_notification).to receive(:except).with("kind", "timestamp").and_return({ subscription: serialized_subscription.as_json})
      BraintreeService::Notification.process(incoming_subscription_notification)
      last_notification = BraintreeService::Notification.last
      payload = JSON.parse(last_notification.payload)
      expect(payload['subscription']['id']).to eq(subscription.id)
    end

    it "processes subscription payment" do 
      serialized_subscription = BraintreeService::SubscriptionSerializer.new(incoming_subscription_notification.subscription)
      allow(incoming_subscription_notification).to receive(:except).with("kind", "timestamp").and_return({ subscription: serialized_subscription.as_json})
      expect(BraintreeService::Notification).to receive(:process_subscription).with(incoming_subscription_notification)
      BraintreeService::Notification.process(incoming_subscription_notification)
    end

    it "processes dispute" do 
      allow(incoming_dispute_notification).to receive(:except).with("kind", "timestamp").and_return(incoming_dispute_notification.dispute)
      expect(BraintreeService::Notification).to receive(:process_dispute).with(incoming_dispute_notification)
      BraintreeService::Notification.process(incoming_dispute_notification)
    end
  end

  describe "#process subscription" do
    let(:member) { create(:member) }
    let(:invoice) { create(:invoice, member: member) }
    let(:subscription) { build(:subscription, id: invoice.generate_subscription_id) }
    let(:notification) { double(kind: ::Braintree::WebhookNotification::Kind::SubscriptionChargedSuccessfully, subscription: subscription) }
    let(:transaction) { build(:transaction, id: "foo") }

    it "Settles invoice and renews resource" do 
      init_member_expiration = member.pretty_time
      allow(notification).to receive_message_chain(:subscription, :transactions, :last).and_return(transaction)
      allow(transaction).to receive(:line_items).and_return([])
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/recurring payment/i)

      BraintreeService::Notification.process_subscription(notification)

      member.reload
      invoice.reload
      expect(member.pretty_time.to_i).to be > (init_member_expiration.to_i)
      expect(invoice.settled).to be_truthy
      expect(invoice.transaction_id).to eq(transaction.id)
    end 

    it "Reports error if no subscription is found" do 
      allow(notification).to receive_message_chain(:subscription).and_return(nil)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/malformed subscription/i)
      BraintreeService::Notification.process_subscription(notification)
    end

    it "reports error if no invoice is found" do 
      allow(notification).to receive_message_chain(:subscription, :transactions, :last).and_return(transaction)
      allow(Invoice).to receive(:active_invoice_for_resource).and_return(nil)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/no active invoice/i)
      BraintreeService::Notification.process_subscription(notification)
    end

    it "reports error if no resoruce is found" do 
      allow(Invoice).to receive(:active_invoice_for_resource).and_return(invoice)
      allow(invoice).to receive(:submit_for_settlement).and_raise(Error::NotFound)      
      allow(notification).to receive_message_chain(:subscription, :transactions, :last).and_return(transaction)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/unknown resource/i)
      BraintreeService::Notification.process_subscription(notification)
    end

    it "reports error if unable to renew resource" do 
      allow(Invoice).to receive(:active_invoice_for_resource).and_return(invoice)
      allow(invoice).to receive(:submit_for_settlement).and_raise(Error::UnprocessableEntity, "Some error")      
      allow(notification).to receive_message_chain(:subscription, :transactions, :last).and_return(transaction)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/some error/i)
      BraintreeService::Notification.process_subscription(notification)
    end
  end

  describe "#process_dispute" do 
    let(:member) { create(:member) }
    let(:invoice) { create(:invoice, member: member, transaction_id: "foo") }
    let(:notification) { double(kind: ::Braintree::WebhookNotification::Kind::DisputeOpened, dispute: dispute) }
    let(:transaction) { build(:transaction, id: "foo") }

    it "Notifies and sets invoice to refund requested" do 
      invoice # Call to initialize
      allow(notification).to receive_message_chain(:dispute, :transaction).and_return(transaction)
      allow(transaction).to receive(:line_items).and_return([])
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/received dispute/i)

      BraintreeService::Notification.process_dispute(notification)
      invoice.reload
      expect(invoice.refund_requested).to be_truthy
    end 

    it "Reports error if no transaction is found" do 
      allow(notification).to receive_message_chain(:dispute, :transaction).and_return(nil)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/malformed dispute/i)
      BraintreeService::Notification.process_dispute(notification)
    end

    it "reports error if no invoice is found" do 
      allow(notification).to receive_message_chain(:dispute, :transaction).and_return(transaction)
      allow(Invoice).to receive(:active_invoice_for_resource).and_return(nil)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/cannot find related invoice/i)
      BraintreeService::Notification.process_dispute(notification)
    end
  end
end