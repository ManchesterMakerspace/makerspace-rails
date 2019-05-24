require 'rails_helper'

RSpec.describe InvoiceOptionsController, type: :controller do

  let(:member) { create(:member)}
  let(:rental) { create(:rental, member: member)}

  describe "GET #index" do
    it "renders json of enabled resources" do
      disabled_io = create(:invoice_option, disabled: true)
      first_io = create(:invoice_option, subscription: true)
      second_io = create(:invoice_option, subscription: false, disabled: false)

      get :index, params: {}

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['invoices']).to contain(first_io)
      expect(parsed_response['invoices']).to contain(second_io)
      expect(parsed_response['invoices']).not.to contain(disabled_io)
    end

    it "limits to only subscription options when requested" do 
      disabled_io = create(:invoice_option, disabled: true)
      first_io = create(:invoice_option, subscription: true)
      second_io = create(:invoice_option, subscription: false, disabled: false)

      get :index, params: { subscription_only: true }

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['invoices']).to eq([second_io])
    end

    describe "limits to type when requested" do 
      it "selects member types" do 
        first_io = create(:invoice_option, subscription: true, resource_class: "rental")
        second_io = create(:invoice_option, subscription: false, resource_class: "member")
  
        get :index, params: { types: ["member"] }
  
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['invoices']).to eq([second_io])
      end

      it "selects rental types" do 
        first_io = create(:invoice_option, subscription: true, resource_class: "rental")
        second_io = create(:invoice_option, subscription: false, resource_class: "member")
  
        get :index, params: { types: ["rental"] }
  
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['invoices']).to eq([first_io])
      end
    end
  end

  describe "Admin request" do 
    login_admin

    describe "GET #index" do
      it "renders all invoice options" do
        disabled_io = create(:invoice_option, disabled: true)
      first_io = create(:invoice_option, subscription: true)
      second_io = create(:invoice_option, subscription: false, disabled: false)

      get :index, params: {}

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['invoices']).to contain(first_io)
      expect(parsed_response['invoices']).to contain(second_io)
      expect(parsed_response['invoices']).to contain(disabled_io)
      end
    end
  end
end
