require 'rails_helper'

RSpec.describe Admin::Billing::TransactionsController, type: :controller do
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

  login_admin

  before(:each) do
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
    @request.env["devise.mapping"] = Devise.mappings[:member]
  end

  describe "GET #index" do 
    let(:related_invoice) { create(:invoice) }
    let(:transaction) { build(:transaction, invoice: related_invoice) }
    it "renders a list of transactions" do 
      related_invoice # call to initialize
      allow(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, {}).and_return([transaction])
      expect(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, {}).and_return([transaction])
      
      get :index, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['transactions'].first['id']).to eq(transaction.id)
      expect(parsed_response['transactions'].first['invoice']['id']).to eq(related_invoice.id.to_s)
    end

    describe "filter transactions by member" do
      it "renders error if member is not a customer" do 
        get :index, params: { searchBy: "member", searchId: non_customer.id }, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(422)
        expect(parsed_response['message']).to match(/customer/i)
      end

      it "renders error if member not found" do 
        get :index, params: { searchBy: "member", searchId: "foo" }, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(404)
        expect(parsed_response['message']).to match(/resource not found/i)
      end

      it "renders list of members transactions" do 
        search_params = {
          customer_id: member.customer_id
        }

        allow(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, search_params).and_return([transaction])
        expect(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, search_params).and_return([transaction])
        
        get :index, params: { searchBy: "member", searchId: member.id }, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(parsed_response['transactions'].first['id']).to eq(transaction.id)
        expect(parsed_response['transactions'].first['invoice']['id']).to eq(related_invoice.id.to_s)
      end
    end

    it "can filter transactions by subscription" do 
      allow(BraintreeService::Subscription).to receive_message_chain(:get_subscription, transactions: [transaction])
      expect(BraintreeService::Subscription).to receive(:get_subscription).with(gateway, "subscription_id")
      expect(BraintreeService::Transaction).not_to receive(:get_transactions)
      
      get :index, params: { searchBy: "subscription", searchId: "subscription_id" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['transactions'].first['id']).to eq(transaction.id)
      expect(parsed_response['transactions'].first['invoice']['id']).to eq(related_invoice.id.to_s)
    end

    it "can filter transactions by date" do 
      start = "02-03-2001"
      end_date = "03-03-2001"
      search_params = {
        start_date: start,
        end_date: end_date
      }
      allow(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, search_params).and_return([transaction])
      expect(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, search_params).and_return([transaction])
      
      get :index, params: { startDate: start, endDate: end_date }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['transactions'].first['id']).to eq(transaction.id)
      expect(parsed_response['transactions'].first['invoice']['id']).to eq(related_invoice.id.to_s)
    end
  end

  describe "GET #show" do 
    it "renders a transaction" do 
      allow(BraintreeService::Transaction).to receive(:get_transaction).with(gateway, "foo").and_return(transaction)
      expect(BraintreeService::Transaction).to receive(:get_transaction).with(gateway, "foo").and_return(transaction)
      
      get :show, params: { id: "foo" }, format: :json 
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['transaction']['id']).to eq(transaction.id)
    end
  end

  describe "DELETE #destroy" do 
    it "refunds the requested transaction" do 
      allow(::BraintreeService::Transaction).to receive(:refund).with(gateway, transaction.id)
      expect(::BraintreeService::Transaction).to receive(:refund).with(gateway, transaction.id)
      delete :destroy, params: { id: transaction.id }, format: :json
      expect(response).to have_http_status(204)
    end
  end
end
