require 'rails_helper'

RSpec.describe InvoiceOptionsController, type: :controller do

  let(:member) { create(:member)}
  let(:rental) { create(:rental, member: member)}

  describe "GET #index" do
    it "renders json of enabled resources" do
      disabled_io = create(:invoice_option, disabled: true)
      first_io = create(:invoice_option, plan_id: "foo")
      second_io = create(:invoice_option, plan_id: nil, disabled: false)

      get :index, params: {}

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['invoiceOptions'].first['id']).to eq(first_io.id.to_s)
      expect(parsed_response['invoiceOptions'].last['id']).to eq(second_io.id.to_s)
      expect(parsed_response['invoiceOptions'].count).to eq(2)
    end

    it "limits to only subscription options when requested" do 
      disabled_io = create(:invoice_option, disabled: true)
      first_io = create(:invoice_option, plan_id: "foo")
      second_io = create(:invoice_option, plan_id: nil, disabled: false)

      get :index, params: { subscription_only: true }

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['invoiceOptions'].first['id']).to eq(first_io.id.to_s)
      expect(parsed_response['invoiceOptions'].count).to eq(1)
    end

    describe "limits to type when requested" do 
      it "selects member types" do 
        first_io = create(:invoice_option, plan_id: "foo", resource_class: "rental")
        second_io = create(:invoice_option, plan_id: nil, resource_class: "member")
  
        get :index, params: { types: ["member"] }
  
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['invoiceOptions'].first['id']).to eq(second_io.id.to_s)
        expect(parsed_response['invoiceOptions'].count).to eq(1)
      end

      it "selects rental types" do 
        first_io = create(:invoice_option, plan_id: "foo", resource_class: "rental")
        second_io = create(:invoice_option, plan_id: nil, resource_class: "member")
  
        get :index, params: { types: ["rental"] }
  
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['invoiceOptions'].first['id']).to eq(first_io.id.to_s)
        expect(parsed_response['invoiceOptions'].count).to eq(1)
      end
    end
  end

  describe "Admin request" do 
    login_admin

    describe "GET #index" do
      it "renders all invoice options" do
        disabled_io = create(:invoice_option, disabled: true)
        first_io = create(:invoice_option, plan_id: "foo")
        second_io = create(:invoice_option, plan_id: nil, disabled: false)

        get :index, params: {}

        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['invoiceOptions'].first['id']).to eq(disabled_io.id.to_s)
        expect(parsed_response['invoiceOptions'].last['id']).to eq(second_io.id.to_s)
        expect(parsed_response['invoiceOptions'][1]['id']).to eq(first_io.id.to_s)
        expect(parsed_response['invoiceOptions'].count).to eq(3)
      end
    end
  end
end
