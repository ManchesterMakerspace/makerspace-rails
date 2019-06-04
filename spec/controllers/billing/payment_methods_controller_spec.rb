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

RSpec.describe Billing::PaymentMethodsController, type: :controller do
  let(:gateway) { double("Gateway") }
  let(:non_customer) { create(:member) }
  let(:member) { create(:member, customer_id: "bar") }
  let(:payment_method) { build(:credit_card) }
  let(:invoice) { create(:invoice, member: member) }
  let(:subscription) { build(:subscription, id: "foobar") }

  let(:failed_result) { double("Failed", success?: false) }
  let(:success_result) { double("Success", success?: true) }

  let(:valid_params) {
    { 
      payment_method_nonce: "some_nonce",
      make_default: true,
    }
  }

  before(:each) do
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
    @request.env["devise.mapping"] = Devise.mappings[:member]
    sign_in member
  end

  describe "GET #new" do 
    it "generates a client token" do 
      allow(gateway).to receive_message_chain(:client_token, :generate).and_return("some_token")
      expect(gateway).to receive_message_chain(:client_token, :generate).and_return("some_token")

      get :new, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['clientToken']).to eq("some_token")
    end
  end

  describe "GET #index" do 
    it "fetches payment methods for customer" do 

      allow(::BraintreeService::PaymentMethod).to receive(:get_payment_methods_for_customer).with(gateway, "bar").and_return([payment_method])
      expect(::BraintreeService::PaymentMethod).to receive(:get_payment_methods_for_customer).with(gateway, "bar").and_return([payment_method])
      get :index, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['paymentMethods'].first['id']).to eq(payment_method.token)
    end

    it "renders an empty list if current member is not a customer" do 
      sign_in non_customer
      expect(::BraintreeService::PaymentMethod).not_to receive(:get_payment_methods_for_customer)
      get :index, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['paymentMethods']).to eq([])
    end
  end

  describe "POST #create" do 
    it "creates payment method for customer" do 
      expect(gateway).not_to receive(:customer)
      expect(gateway).to receive_message_chain(:payment_method, create: success_result)
      expect(success_result).to receive(:try).with(:payment_method).and_return(true)
      expect(success_result).to receive(:payment_method).and_return(payment_method)

      post :create, params: { payment_method: valid_params }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['paymentMethod']['id']).to eq(payment_method.token)
    end

    it "creates a customer with new payment method if not already a customer" do 
      sign_in non_customer
      allow(gateway).to receive_message_chain(:customer, create: success_result)
      expect(gateway).to receive_message_chain(:customer, create: success_result)
      expect(gateway).not_to receive(:payment_method)
      
      allow(success_result).to receive_message_chain(:customer, id: "new_customer")
      expect(success_result).to receive_message_chain(:customer, id: "new_customer")

      allow(success_result).to receive(:payment_method).and_return(false)
      allow(success_result).to receive_message_chain(:customer, :payment_methods, first: payment_method)

      post :create, params: { payment_method: valid_params }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['paymentMethod']['id']).to eq(payment_method.token)

      non_customer.reload
      expect(non_customer.customer_id).to eq("new_customer")
    end

    it "renders error if no nonce is provided" do 
      post :create, params: { payment_method: { make_default: true} }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(422)
      expect(parsed_response['message']).to match(/payment_method_nonce/i)
    end

    it "raises error if create failed" do 
      allow(gateway).to receive_message_chain(:payment_method, create: failed_result)
      expect(gateway).to receive_message_chain(:payment_method, create: failed_result)
      allow(Error::Braintree::Result).to receive(:new).with(failed_result).and_return(Error::Braintree::Result.new) # Bypass error instantiation
      
      post :create, params: { payment_method: valid_params }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(503)
      expect(parsed_response['message']).to match(/service unavailable/i)
    end
  end

  describe "DELETE #destroy" do 
    it "deletes payment method for member" do
      allow(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).with(gateway, "foobar", "bar").and_return(payment_method)
      expect(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).with(gateway, "foobar", "bar").and_return(payment_method)

      allow(BraintreeService::PaymentMethod).to receive(:delete_payment_method).with(gateway, payment_method.token).and_return(success_result)
      expect(BraintreeService::PaymentMethod).to receive(:delete_payment_method).with(gateway, payment_method.token).and_return(success_result)
      
      delete :destroy, params: { id: "foobar" }, format: :json
      expect(response).to have_http_status(204)
    end

    it "raises error if delete failed" do 
      allow(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).with(gateway, "foobar", "bar").and_return(payment_method)
      expect(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).with(gateway, "foobar", "bar").and_return(payment_method)

      allow(BraintreeService::PaymentMethod).to receive(:delete_payment_method).with(gateway, payment_method.token).and_return(failed_result)
      expect(BraintreeService::PaymentMethod).to receive(:delete_payment_method).with(gateway, payment_method.token).and_return(failed_result)
      allow(Error::Braintree::Result).to receive(:new).with(failed_result).and_return(Error::Braintree::Result.new) # Bypass error instantiation
      
      delete :destroy, params: { id: "foobar" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(503)
      expect(parsed_response['message']).to match(/service unavailable/i)
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
