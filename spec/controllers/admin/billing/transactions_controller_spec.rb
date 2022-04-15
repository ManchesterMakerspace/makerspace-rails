require 'rails_helper'

RSpec.describe Admin::Billing::TransactionsController, type: :controller do
  let(:gateway) { double }
  let(:non_customer) { create(:member) }
  let(:member) { create(:member, customer_id: "bar") }
  let(:payment_method) { build(:credit_card, customer_id: "bar") }
  let(:invoice) { create(:invoice, member: member) }
  let(:transaction) { build(:transaction) }
  let(:discount_id) { generate(:uid) }
  let(:discounted_transaction) { build(:transaction, discounts: [{
    id: discount_id,
    name: "10% Discount",
    description: "A discount for 10%",
    amount: "6.50",
  }]) }
  let(:admin) { create(:member, :admin) }
  
  let(:valid_params) {
    { 
      payment_method_id: "foo",
      invoice_id: invoice.id
    }
  }

  before(:each) do
    create(:permission, member: admin, name: :billing, enabled: true )
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
    @request.env["devise.mapping"] = Devise.mappings[:member]
    sign_in admin
  end

  describe "GET #index" do 
    let(:transaction) { build(:transaction) }
    let(:related_invoice) { create(:invoice, transaction_id: transaction.id) }
    it "renders a list of transactions" do 
      related_invoice # call to initialize
      allow(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, anything).and_return([transaction])
      expect(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, anything).and_return([transaction])
      
      get :index, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response.first['id']).to eq(transaction.id)
      expect(parsed_response.first['invoice']['id']).to eq(related_invoice.id.to_s)
    end

    it "filters transactions by discount IDs" do 
      related_invoice # call to initialize
      allow(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, anything).and_return([transaction, discounted_transaction])
      expect(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, anything).and_return([transaction, discounted_transaction])
      
      get :index, params: { discountId: discount_id }, format: :json
      expect(response).to have_http_status(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response.first['id']).to eq(discounted_transaction.id)
      expect(parsed_response.length).to eq(1)
    end 
  end

  describe "GET #show" do 
    it "renders a transaction" do 
      allow(BraintreeService::Transaction).to receive(:get_transaction).with(gateway, "foo").and_return(transaction)
      expect(BraintreeService::Transaction).to receive(:get_transaction).with(gateway, "foo").and_return(transaction)
      
      get :show, params: { id: "foo" }, format: :json 
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response['id']).to eq(transaction.id)
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
