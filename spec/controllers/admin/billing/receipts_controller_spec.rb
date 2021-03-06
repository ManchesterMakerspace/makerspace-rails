require 'rails_helper'

RSpec.describe Admin::Billing::ReceiptsController, type: :controller do
  let(:gateway) { double }
  let(:member) { create(:member, :admin) }

  before(:each) do
    create(:billing_permission, member: member)
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
    @request.env["devise.mapping"] = Devise.mappings[:member]
    sign_in member
  end

  describe "GET #show" do
    it "renders html of the retrieved receipt" do
      invoice = create(:invoice, member: member, transaction_id: "t1")
      transaction = build(:transaction, invoice: invoice, id: "t1")
      allow(BraintreeService::Transaction).to receive(:get_transaction).with(gateway, "t1").and_return(transaction)
      
      get :show, params: {id: invoice.to_param}, format: :html

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "text/html"
    end

    it "raises not found if invoice doens't exist" do
      get :show, params: {id: "invalid" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(404)
      expect(parsed_response['message']).to match(/document not found/i)
    end

    it "raises not found if invoice has no transaction" do 
      invoice = create(:invoice, member: member)
      get :show, params: {id: invoice.to_param }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(404)
      expect(parsed_response['message']).to match(/resource not found/i)
    end
  end
end
