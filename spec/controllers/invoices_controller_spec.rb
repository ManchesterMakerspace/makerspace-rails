require 'rails_helper'

RSpec.describe InvoicesController, type: :controller do

  let(:member) { create(:member)}
  let(:rental) { create(:rental, member: member)}

  before(:each) do
    @request.env["devise.mapping"] = Devise.mappings[:member]
    sign_in member
  end

  describe "GET #index" do
    it "renders json of current member's active invoices" do
      create(:settled_invoice, member: member)
      invoices = [
        create(:invoice, member: member),
        create(:invoice, member: member, resource_id: rental.id, resource_class: "rental"),
      ]
      get :index, params: {}

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['invoices']).to eq(invoices)
    end
  end

  describe "POST #create" do
    let(:io) { create(:invoice_option) }
    it "Can create an invoice from an existing invoice option" do 
      post :create, params: { invoice_option: { id: io.id } }
      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['invoice']['amount']).to eq(io.amount)
      expect(parsed_response['invoice']['discount_id']).to eq(nil)
    end

    it  "Can create an invoice with an associated discount" do 
      discount_id = ::BraintreeService::Discount.standard_membership_discount.id
      post :create, params: { invoice_option: { id: io.id, discount_id: discount_id } }
      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['invoice']['amount']).to eq(io.amount)
      expect(parsed_response['invoice']['discount_id']).to eq(discount_id)
    end
  end
end
