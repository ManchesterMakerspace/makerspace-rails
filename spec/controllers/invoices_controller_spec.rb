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
      
      response_ids = parsed_response['invoices'].collect { |i| i['id'] }

      expect(response_ids).to include(invoices.first.id.to_s)
      expect(response_ids).to include(invoices.last.id.to_s)
      expect(response_ids.count).to eq(2)
    end
  end

  describe "POST #create" do
    let(:io) { create(:invoice_option) }
    it "Can create an invoice from an existing invoice option" do 
      post :create, params: { invoice_option: { id: io.id } }
      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['invoice']['amount']).to eq(number_to_currency(io.amount))
      expect(parsed_response['invoice']['discountId']).to eq(nil)
    end

    it  "Can create an invoice with an associated discount" do 
      discount = ::BraintreeService::Discount.standard_membership_discount
      post :create, params: { invoice_option: { id: io.id, discount_id: discount.id } }
      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)

      expect(parsed_response['invoice']['amount']).to eq(number_to_currency(io.amount - discount.amount))
      expect(parsed_response['invoice']['discountId']).to eq(discount.id.to_s)
    end
  end
end
