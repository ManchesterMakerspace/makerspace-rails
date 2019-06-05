# mock nonce from braintree  as appropriate
# "fake-valid-nonce"
# "fake-valid-no-billing-address-nonce"
# "fake-valid-visa-nonce"
# "fake-paypal-one-time-nonce"
# "fake-paypal-billing-agreement-nonce"
# "fake-processor-declined-visa-nonce"
# "fake-consumed-nonce"


#make transaction
# sale_result = gateway.transaction.sale(
#   amount: 100
#   payment_method_nonce: something
#   options: {
#     submit_for_settlement: true
#   }
# )

# Settle it
# result = gateway.testing.settle(sale_result.transaction.id)
# result.success?.should == true
# result.transaction.status.should == Braintree::Transactioon::Status::Settled


# # Decline it
# result = gateway.testing.settlement_delcine(sale_result.transaction.id)
# result.success?.should == true
# result.transaction.status.should == Braintree::Transactioon::Status::SettlmentDeclined



# instantly disputed transaction of any mount:
# test card number === 4023898493988028


require 'rails_helper'

RSpec.describe Billing::SubscriptionsController, type: :controller do
  let(:gateway) { double }
  let(:non_customer) { create(:member) }
  let(:member) { create(:member, customer_id: "bar") }
  let(:payment_method) { build(:payment_method, customer_id: "bar") }
  let(:invoice) { create(:invoice, member: member) }
  let(:subscription) { build(:subscription, id: "foobar") }

  let(:failed_result) { double(success?: false) }
  let(:success_result) { double(success?: true) }

  let(:valid_params) {
    {
      payment_method_token: "some_token",
    }
  }

  before(:each) do
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
    @request.env["devise.mapping"] = Devise.mappings[:member]
    sign_in member
  end

  describe "GET #show" do
    it "fetches a subscription for customer" do
      # Mock current_member call to use double
      allow_any_instance_of(Billing::SubscriptionsController).to receive(:current_member).and_return(member)
      allow(member).to receive(:find_subscribed_resource).with("foobar").and_return(member)
      expect(member).to receive(:find_subscribed_resource).with("foobar").and_return(member)

      allow(::BraintreeService::Subscription).to receive(:get_subscription).with(gateway, "foobar").and_return(subscription)
      get :show, params: { id: "foobar" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['subscription']['id']).to eq("foobar")
    end

    it "Raises error if subscription is not for customer" do
      # Mock current_member call to use double
      allow_any_instance_of(Billing::SubscriptionsController).to receive(:current_member).and_return(member)
      allow(member).to receive(:find_subscribed_resource).with("foobar").and_return(nil)
      expect(member).to receive(:find_subscribed_resource).with("foobar").and_return(nil)

      get :show, params: { id: "foobar" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(404)
      expect(parsed_response['message']).to match(/resource not found/i)
    end

    it "raises error if no customer" do
      sign_in non_customer
      get :show, params: { id: "foobar" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(422)
      expect(parsed_response['message']).to match(/customer/i)
    end
  end

  describe "PUT #update" do
    it "updates a subscription for customer" do
      update_hash = {
        id: "foobar",
        payment_method_token: valid_params[:payment_method_token]
      }
      allow_any_instance_of(Billing::SubscriptionsController).to receive(:current_member).and_return(member)
      allow_any_instance_of(Billing::SubscriptionsController).to receive(:subscription_params).and_return(valid_params)
      allow(member).to receive(:find_subscribed_resource).with("foobar").and_return(member)
      expect(member).to receive(:find_subscribed_resource).with("foobar").and_return(member)
      allow(::BraintreeService::Subscription).to receive(:update).with(gateway, update_hash).and_return(subscription)
      expect(::BraintreeService::Subscription).to receive(:update).with(gateway, update_hash).and_return(subscription)

      put :update, params: { id: "foobar", subscription: valid_params }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['subscription']['id']).to eq(subscription.id)
    end

    it "Raises error if subscription is not for customer" do
      # Mock current_member call to use double
      allow_any_instance_of(Billing::SubscriptionsController).to receive(:current_member).and_return(member)
      allow(member).to receive(:find_subscribed_resource).with("foobar").and_return(nil)
      expect(member).to receive(:find_subscribed_resource).with("foobar").and_return(nil)

      put :update, params: { id: "foobar", subscription: valid_params }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(404)
      expect(parsed_response['message']).to match(/resource not found/i)
    end

    it "raises error if no customer" do
      sign_in non_customer
      put :update, params: { id: "foobar", subscription: valid_params }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(422)
      expect(parsed_response['message']).to match(/customer/i)
    end
  end

  describe "DELETE #destroy" do
    it "Cancels subscription for member" do
      allow_any_instance_of(Billing::SubscriptionsController).to receive(:current_member).and_return(member)
      allow(member).to receive(:find_subscribed_resource).with("foobar").and_return(member)
      expect(member).to receive(:find_subscribed_resource).with("foobar").and_return(member)
      allow(::BraintreeService::Subscription).to receive(:cancel).with(gateway, "foobar").and_return(success_result)
      expect(::BraintreeService::Subscription).to receive(:cancel).with(gateway, "foobar").and_return(success_result)
      allow(success_result).to receive(:subscription).and_return(subscription)

      delete :destroy, params: { id: "foobar" }, format: :json
      expect(response).to have_http_status(204)
    end

    it "Raises error if subscription is not for customer" do
      # Mock current_member call to use double
      allow_any_instance_of(Billing::SubscriptionsController).to receive(:current_member).and_return(member)
      allow(member).to receive(:find_subscribed_resource).with("foobar").and_return(nil)
      expect(member).to receive(:find_subscribed_resource).with("foobar").and_return(nil)

      delete :destroy, params: { id: "foobar" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(404)
      expect(parsed_response['message']).to match(/resource not found/i)
    end

    it "raises error if no customer" do
      sign_in non_customer
      delete :destroy, params: { id: "foobar" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(422)
      expect(parsed_response['message']).to match(/customer/i)
    end
  end
end
