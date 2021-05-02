require "rails_helper"

RSpec.describe "Braintree Notification Handling", :type => :request do
  let(:gateway) { double }
  let(:member) { create(:member, customer_id: "bar") }
  let(:invoice) { create(:invoice, member: member, subscription_id: "some_id") }
  let(:subscription) { build(:subscription, id: invoice.generate_subscription_id) }
  let(:invoice_option) { create(:invoice_option, id: "444", plan_id: "monthly_membership_subscription") }
  let(:fake_transaction) { double(id: "foo") }

  before(:each) do
      create(:billing_permission, member: member)
      sign_in member
  end

  
  it "Sends a notification if prior payment failed" do 
    notification = Service::BraintreeGateway.connect_gateway.webhook_testing.sample_notification(
      Braintree::WebhookNotification::Kind::SubscriptionChargedSuccessfully,
      subscription.id
    )

    # Create payment method then pass to invoice option call
    invoice_opt = create(:invoice_option, name: "One Month", amount: 65.0, id: "one-month", plan_id: "monthly_membership_subscription")
    InvoiceHelper.update_lifecycle(invoice.id, InvoiceHelper::LIFECYCLES[:Failed])
    expect(BraintreeService::Notification).to receive(:enque_message).with("Recurring payment from #{member.fullname} successful. Processing invoice...")

    post "/billing/braintree_listener", params: notification
    expect(response).to have_http_status(200)
  end

  it "Sends a notification if prior cancellation failed" do 
    notification = Service::BraintreeGateway.connect_gateway.webhook_testing.sample_notification(
      Braintree::WebhookNotification::Kind::SubscriptionCanceled,
      subscription.id
    )

    # Create payment method then pass to invoice option call
    invoice_opt = create(:invoice_option, name: "One Month", amount: 65.0, id: "one-month", plan_id: "monthly_membership_subscription")
    InvoiceHelper.update_lifecycle(invoice.id, InvoiceHelper::LIFECYCLES[:CancelFailed])
    expect(Invoice).to receive(:process_cancellation).with(invoice.id)

    post "/billing/braintree_listener", params: notification
    expect(response).to have_http_status(200)
  end

  it "Handles duplicate subscription created requests" do 
    notification = Service::BraintreeGateway.connect_gateway.webhook_testing.sample_notification(
      Braintree::WebhookNotification::Kind::SubscriptionChargedSuccessfully,
      subscription.id
    )
    # Create payment method then pass to invoice option call
    invoice_opt = create(:invoice_option, name: "One Month", amount: 65.0, id: "one-month", plan_id: "monthly_membership_subscription")
    InvoiceHelper.update_lifecycle(invoice.id, InvoiceHelper::LIFECYCLES[:Success])
    expect(BraintreeService::Notification).to receive(:enque_message).with(
      "Duplicate SubscriptionChargedSuccessfully notification for successful invoice #{invoice.id}. Skipping processing",
      "treasurer"
    )

    post "/billing/braintree_listener", params: notification
    expect(response).to have_http_status(200)
  end

  it "Handles duplicate subscription creating requests" do 
    notification = Service::BraintreeGateway.connect_gateway.webhook_testing.sample_notification(
      Braintree::WebhookNotification::Kind::SubscriptionChargedSuccessfully,
      subscription.id
    )
    # Create payment method then pass to invoice option call
    invoice_opt = create(:invoice_option, name: "One Month", amount: 65.0, id: "one-month", plan_id: "monthly_membership_subscription")
    InvoiceHelper.update_lifecycle(invoice.id, InvoiceHelper::LIFECYCLES[:InProgress])
    expect(BraintreeService::Notification).to receive(:enque_message).with(
      "Duplicate SubscriptionChargedSuccessfully notification for in-progress invoice #{invoice.id}. Skipping processing",
      "treasurer"
    )

    post "/billing/braintree_listener", params: notification
    expect(response).to have_http_status(200)
  end

  it "Handles duplicate subscription canceled requests" do 
    notification = Service::BraintreeGateway.connect_gateway.webhook_testing.sample_notification(
      Braintree::WebhookNotification::Kind::SubscriptionCanceled,
      subscription.id
    )
    # Create payment method then pass to invoice option call
    invoice_opt = create(:invoice_option, name: "One Month", amount: 65.0, id: "one-month", plan_id: "monthly_membership_subscription")

    # allow_any_instance_of(Braintree::Subscription).to receive_message_chain(:transactions, :first).and_return(fake_transaction)
    InvoiceHelper.update_lifecycle(invoice.id, InvoiceHelper::LIFECYCLES[:Cancelled])
    expect(BraintreeService::Notification).to receive(:enque_message).with(
      "Duplicate SubscriptionCanceled notification for cancelled invoice #{invoice.id}. Skipping processing",
      "treasurer"
    )

    post "/billing/braintree_listener", params: notification
    expect(response).to have_http_status(200)
  end

  it "Handles duplicate subscription cancelling requests" do 
    notification = Service::BraintreeGateway.connect_gateway.webhook_testing.sample_notification(
      Braintree::WebhookNotification::Kind::SubscriptionCanceled,
      subscription.id
    )
    # Create payment method then pass to invoice option call
    invoice_opt = create(:invoice_option, name: "One Month", amount: 65.0, id: "one-month", plan_id: "monthly_membership_subscription")

    # allow_any_instance_of(Braintree::Subscription).to receive_message_chain(:transactions, :first).and_return(fake_transaction)
    InvoiceHelper.update_lifecycle(invoice.id, InvoiceHelper::LIFECYCLES[:Cancelling])
    expect(BraintreeService::Notification).to receive(:enque_message).with(
      "Duplicate SubscriptionCanceled notification for in-progress cancellation invoice #{invoice.id}. Skipping processing",
      "treasurer"
    )

    post "/billing/braintree_listener", params: notification
    expect(response).to have_http_status(200)
  end
end