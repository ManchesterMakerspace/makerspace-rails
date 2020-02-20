require 'rails_helper'

RSpec.describe BraintreeService::Notification, type: :model do
  let(:gateway) { double } # Create a fake gateway
  let(:member) { create(:member) }
  let(:invoice) { create(:invoice, member: member, subscription_id: "some_id") }
  let(:subscription) { build(:subscription, id: invoice.generate_subscription_id) }
  let(:transaction) { build(:transaction, id: "foo") }

  let(:pd_transaction) { build(:transaction, id: "bar") }

  let(:successful_charge_notification) { double(kind: ::Braintree::WebhookNotification::Kind::SubscriptionChargedSuccessfully, subscription: subscription, timestamp: Time.now) }
  let(:failed_transaction_notification) { double(kind: ::Braintree::WebhookNotification::Kind::TransactionSettlementDeclined, transaction: pd_transaction, timestamp: Time.now) }
  let(:success_transaction_notification) { double(kind: ::Braintree::WebhookNotification::Kind::TransactionSettled, transaction: transaction, timestamp: Time.now) }
  let(:incoming_dispute_notification) { double(kind: ::Braintree::WebhookNotification::Kind::DisputeOpened, dispute: dispute, timestamp: Time.now) }
  let(:dispute) { build(:dispute) }

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
    before(:each) do
      allow(successful_charge_notification).to receive_message_chain(:subscription, :transactions, :first).and_return(transaction)
    end

    it "reads notification and stores in db" do
      expect {
        BraintreeService::Notification.process(successful_charge_notification).to change(BraintreeService::Notification, :count).by(1)
      }
    end

    it "processes subscription payment" do
      expect(BraintreeService::Notification).to receive(:process_subscription_charge_success).with(invoice, transaction)
      BraintreeService::Notification.process(successful_charge_notification)
    end

    it "processes subscription payment failure" do
      failure = double(kind: ::Braintree::WebhookNotification::Kind::SubscriptionChargedUnsuccessfully, subscription: subscription, timestamp: Time.now)
      allow(failure).to receive_message_chain(:subscription, :transactions, :first).and_return(transaction)
      expect(BraintreeService::Notification).to receive(:process_subscription_charge_failure).with(invoice, transaction)
      BraintreeService::Notification.process(failure)
    end

    it "processes subscription cancellation" do
      cancellation = double(kind: ::Braintree::WebhookNotification::Kind::SubscriptionCanceled, subscription: subscription, timestamp: Time.now)
      expect(BraintreeService::Notification).to receive(:process_subscription_cancellation).with(invoice)
      BraintreeService::Notification.process(cancellation)
    end
    
    it "processes dispute" do
      expect(BraintreeService::Notification).to receive(:process_dispute).with(incoming_dispute_notification)
      BraintreeService::Notification.process(incoming_dispute_notification)
    end
  end

  describe "#process subscription" do
    before(:each) do
      allow(successful_charge_notification).to receive_message_chain(:subscription, :transactions, :first).and_return(transaction)
    end

    it "Settles invoice and renews resource" do
      create(:card, member: member)
      init_member_expiration = member.pretty_time
      allow(transaction).to receive(:line_items).and_return([])
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/recurring payment/i)

      BraintreeService::Notification.process_subscription(successful_charge_notification)
      member.reload
      invoice.reload
      expect(invoice.settled).to be_truthy
      expect(member.pretty_time.to_i).to be > (init_member_expiration.to_i)
      expect(invoice.transaction_id).to eq(transaction.id)
    end

    it "Skips settlement if invoice locked" do 
      invoice.lock
      create(:card, member: member)
      init_member_expiration = member.pretty_time
      allow(transaction).to receive(:line_items).and_return([])
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/in-process invoice/i, "treasurer")

      BraintreeService::Notification.process_subscription(successful_charge_notification)
      member.reload
      invoice.reload
      expect(invoice.settled).to be_falsy
      expect(member.pretty_time.to_i).to eq(init_member_expiration.to_i)
    end

    it "Reports error if no subscription is found" do
      allow(successful_charge_notification).to receive_message_chain(:subscription).and_return(nil)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/malformed subscription/i)
      BraintreeService::Notification.get_details_for_notification(successful_charge_notification)
    end

    it "reports error if no invoice is found" do
      allow(successful_charge_notification).to receive_message_chain(:subscription, :transactions, :first).and_return(transaction)
      allow(Invoice).to receive(:active_invoice_for_resource).and_return(nil)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/no active invoice/i, "treasurer")
      BraintreeService::Notification.process_subscription(successful_charge_notification)
    end

    it "reports error if no resoruce is found" do
      allow(Invoice).to receive(:active_invoice_for_resource).and_return(invoice)
      allow(invoice).to receive(:submit_for_settlement).and_raise(Error::NotFound)
      allow(successful_charge_notification).to receive_message_chain(:subscription, :transactions, :first).and_return(transaction)
      allow(BraintreeService::Notification).to receive(:send_slack_message).with(/processing invoice/i)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/unknown resource/i)
      BraintreeService::Notification.process_subscription(successful_charge_notification)
    end

    it "reports error if unable to renew resource" do
      allow(Invoice).to receive(:active_invoice_for_resource).and_return(invoice)
      allow(invoice).to receive(:submit_for_settlement).and_raise(Error::UnprocessableEntity, "Some error")
      allow(successful_charge_notification).to receive_message_chain(:subscription, :transactions, :first).and_return(transaction)
      allow(BraintreeService::Notification).to receive(:send_slack_message).with(/processing invoice/i)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/some error/i)
      BraintreeService::Notification.process_subscription(successful_charge_notification)
    end
  end

  describe "#process_dispute" do
    let(:member) { create(:member) }
    let(:invoice) { create(:invoice, member: member, transaction_id: "foo") }
    let(:notification) { double(kind: ::Braintree::WebhookNotification::Kind::DisputeOpened, dispute: dispute) }
    let(:transaction) { build(:transaction, id: "foo") }

    it "Notifies and sets invoice to dispute requested" do
      invoice # Call to initialize
      allow(notification).to receive_message_chain(:dispute, :transaction).and_return(transaction)
      allow(transaction).to receive(:line_items).and_return([])
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/received dispute/i)

      BraintreeService::Notification.process_dispute(notification)
      invoice.reload
      expect(invoice.dispute_requested).to be_truthy
    end

    it "Reports error if no transaction is found" do
      allow(notification).to receive(:dispute).and_return(nil)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/malformed dispute/i)
      BraintreeService::Notification.get_details_for_notification(notification)
    end

    it "reports error if no invoice is found" do
      allow(notification).to receive_message_chain(:dispute, :transaction).and_return(transaction)
      allow(Invoice).to receive(:active_invoice_for_resource).and_return(nil)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/cannot find related invoice/i)
      BraintreeService::Notification.process_dispute(notification)
    end
  end

  describe "#process_transaction" do 
    before(:each) do
      allow(failed_transaction_notification).to receive(:transaction).and_return(pd_transaction)
    end

    it "Unsettles invoice and un-renews resource on failure" do
      new_member = create(:member)
      settled_invoice = create(:invoice, member: new_member, transaction_id: pd_transaction.id) 
      create(:card, member: new_member)
      new_member.reload
      init_member_expiration = new_member.pretty_time
      allow(pd_transaction).to receive(:line_items).and_return([])
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/failed with status/i)

      BraintreeService::Notification.process_transaction(failed_transaction_notification)
      new_member.reload
      settled_invoice.reload
      expect(settled_invoice.settled).to be_falsy
      expect(new_member.pretty_time.to_i).to be < (init_member_expiration.to_i)
      expect(settled_invoice.transaction_id).to eq(pd_transaction.id)
    end

    it "reports error if no invoice is found" do
      allow(Invoice).to receive(:active_invoice_for_resource).and_return(nil)
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/no invoice found/i)
      BraintreeService::Notification.process_transaction(failed_transaction_notification)
    end

    it "Settles invoice on success if not already settled" do 
      new_member = create(:member)
      create(:card, member: new_member)
      settled_invoice = create(:invoice, member: new_member, transaction_id: transaction.id) 
      init_member_expiration = new_member.pretty_time
      allow(transaction).to receive(:line_items).and_return([])
      expect(BraintreeService::Notification).to receive(:send_slack_message).with(/one-time payment/i)

      BraintreeService::Notification.process_transaction(success_transaction_notification)
      new_member.reload
      settled_invoice.reload
      expect(settled_invoice.settled).to be_truthy
      expect(new_member.pretty_time.to_i).to be > (init_member_expiration.to_i)
    end
  end
end