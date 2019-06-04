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

RSpec.describe Billing::TransactionsController, type: :controller do
  let(:gateway) { double }
  let(:non_customer) { create(:member) }
  let(:member) { create(:member, customer_id: "bar") }
  let(:payment_method) { build(:credit_card, customer_id: "bar") }
  let(:invoice) { create(:invoice, member: member) }
  let(:transaction) { build(:transaction) }

  let(:valid_params) {
    { 
      payment_method_id: "foo",
      invoice_id: invoice.id
    }
  }

  before(:each) do
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
    @request.env["devise.mapping"] = Devise.mappings[:member]
    sign_in member
  end

  describe "POST #create" do
    it "renders error if no payment method" do 
      post :create, params: { transaction: { invoice_id: invoice.id } }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(422)
      expect(parsed_response['message']).to match(/payment_method_id/i)
    end

    it "verifies the payment method belongs to customer" do 
      allow(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).with(gateway, "foo", member.customer_id).and_raise(Error::Braintree::CustomerMismatch)
      expect(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).with(gateway, "foo", member.customer_id).and_raise(Error::Braintree::CustomerMismatch)
      post :create, params: { transaction: valid_params }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(403)
      expect(parsed_response['message']).to match(/customer/i)
    end

    it "renders error if no invoice exists" do 
      allow(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).with(gateway, "123", member.customer_id)
      post :create, params: { transaction: { payment_method_id: "123", invoice_id: "foo" } }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(404)
      expect(parsed_response['message']).to match(/resource not found/i)
    end

    it "renders error about no customer" do 
      sign_in non_customer
      post :create, params: { transaction: valid_params }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(422)
      expect(parsed_response['message']).to match(/customer/i)
    end

    it "settles the invoice" do 
      allow(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).and_return(payment_method)
      allow(invoice).to receive(:submit_for_settlement).with(gateway, "foo").and_return(transaction)
      allow(Invoice).to receive(:find).with(invoice.id).and_return(invoice) # Mock this return so that it returns a double instead

      post :create, params: { transaction: valid_params }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['transaction']['id']).to eq(transaction.id)
    end
  end

  describe "GET #index" do 
    let(:related_invoice) { create(:invoice) }
    let(:transaction) { build(:transaction, invoice: related_invoice) }
    it "renders a list of transactions" do 
      related_invoice # call to initialize
      allow(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, { customer_id: member.customer_id }).and_return([transaction])
      expect(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, { customer_id: member.customer_id }).and_return([transaction])
      
      get :index, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['transactions'].first['id']).to eq(transaction.id)
      expect(parsed_response['transactions'].first['invoice']['id']).to eq(related_invoice.id.to_s)
    end

    it "renders error about no customer" do 
      sign_in non_customer
      get :index, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(422)
      expect(parsed_response['message']).to match(/customer/i)
    end
  end

  describe "DELETE #destroy" do 
    let(:wrong_customer) { create(:member, customer_id: "foo") }
    let(:transaction_invoice) { create(:invoice, transaction_id: transaction.id, member: member)}

    it "requests a refund for the requested invoice" do 
      # Mock all these calls but make sure they occur
      allow(::BraintreeService::Transaction).to receive(:get_transaction).with(gateway, transaction.id).and_return(transaction)
      expect(::BraintreeService::Transaction).to receive(:get_transaction).with(gateway, transaction.id).and_return(transaction)
      
      allow(Invoice).to receive(:find_by).with({ transaction_id: transaction.id, member_id: member.id }).and_return(transaction_invoice)
      expect(Invoice).to receive(:find_by).with({ transaction_id: transaction.id, member_id: member.id }).and_return(transaction_invoice)

      allow(transaction_invoice).to receive(:request_refund)
      expect(transaction_invoice).to receive(:request_refund)

      delete :destroy, params: { id: transaction.id }, format: :json
      expect(response).to have_http_status(204)
    end

    it "renders an error if can't find invoice" do
      unmatched_transaction = build(:transaction)
      allow(::BraintreeService::Transaction).to receive(:get_transaction).with(gateway, unmatched_transaction.id).and_return(unmatched_transaction)
      
      delete :destroy, params: { id: unmatched_transaction.id }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(404)
      expect(parsed_response['message']).to match(/resource not found/i)
    end

    it "renders error if invoice doesnt belong to current member" do 
      other_member_invoice = create(:invoice, transaction_id: transaction.id)
      allow(::BraintreeService::Transaction).to receive(:get_transaction).with(gateway, transaction.id).and_return(transaction)
      
      delete :destroy, params: { id: transaction.id }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(404)
      expect(parsed_response['message']).to match(/resource not found/i)
    end

    it "renders error about no customer" do 
      sign_in non_customer
      delete :destroy, params: { id: "foobar" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(422)
      expect(parsed_response['message']).to match(/customer/i)
    end
  end
end
