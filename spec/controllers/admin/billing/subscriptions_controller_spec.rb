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

RSpec.describe Admin::Billing::SubscriptionsController, type: :controller do
  let(:gateway) { double }
  let(:non_customer) { create(:member) }
  let(:member) { create(:member, customer_id: "bar", subscription_id: "foobar") }
  let(:payment_method) { build(:payment_method, customer_id: "bar") }
  let(:invoice) { create(:invoice, member: member) }
  let(:subscription) { build(:subscription, id: "foobar") }

  let(:failed_result) { double(success?: false) }
  let(:success_result) { double(success?: true) }

  let(:valid_params) {
    { 
      payment_method_token: "some_token",
      invoice_option_id: "std_membership_option"
    }
  }

  login_admin

  before(:each) do
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
    @request.env["devise.mapping"] = Devise.mappings[:member]
  end

  describe "GET #index" do 
    let(:cancelled_subscription) { build(:subscription, status: Braintree::Subscription::Status::Canceled )}
    it "renders a list of subscriptions" do 
      subscriptions = [cancelled_subscription, subscription]
      allow(BraintreeService::Subscription).to receive(:get_subscriptions).with(gateway).and_return(subscriptions)
      expect(BraintreeService::Subscription).to receive(:get_subscriptions).with(gateway).and_return(subscriptions)

      get :index, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['subscriptions'].first['id']).to eq(cancelled_subscription.id)
    end

    it "can filter out cancelled subscriptions" do 
      subscriptions = [cancelled_subscription, subscription]
      allow(BraintreeService::Subscription).to receive(:get_subscriptions).with(gateway).and_return(subscriptions)
      expect(BraintreeService::Subscription).to receive(:get_subscriptions).with(gateway).and_return(subscriptions)

      get :index, params: { hideCanceled: true }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['subscriptions'].first['id']).to eq(subscription.id)
    end
  end

  describe "DELETE #destroy" do 
    it "Cancels subscription for member" do
      allow(::BraintreeService::Subscription).to receive(:get_subscription).with(gateway, "foobar").and_return(subscription)
      expect(::BraintreeService::Subscription).to receive(:get_subscription).with(gateway, "foobar").and_return(subscription)

      allow(::BraintreeService::Subscription).to receive(:cancel).with(gateway, "foobar").and_return(success_result)
      expect(::BraintreeService::Subscription).to receive(:cancel).with(gateway, "foobar").and_return(success_result)

      allow(subscription).to receive(:resource).and_return(member)

      delete :destroy, params: { id: "foobar" }, format: :json
      expect(response).to have_http_status(204)

      member.reload
      expect(member.subscription).to be_falsey
    end

    it "raises error if cancellation failed" do 
      allow(::BraintreeService::Subscription).to receive(:get_subscription).with(gateway, "foobar").and_return(subscription)
      expect(::BraintreeService::Subscription).to receive(:get_subscription).with(gateway, "foobar").and_return(subscription)
      allow(::BraintreeService::Subscription).to receive(:cancel).with(gateway, "foobar").and_return(failed_result)
      expect(::BraintreeService::Subscription).to receive(:cancel).with(gateway, "foobar").and_return(failed_result)
      allow(Error::Braintree::Result).to receive(:new).with(failed_result).and_return(Error::Braintree::Result.new) # Bypass error instantiation
      
      delete :destroy, params: { id: "foobar" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(503)
      expect(parsed_response['message']).to match(/service unavailable/i)
    end
  end
end
