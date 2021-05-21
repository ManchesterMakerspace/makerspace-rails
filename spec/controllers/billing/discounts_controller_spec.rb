require 'rails_helper'

RSpec.describe Billing::DiscountsController, type: :controller do
  let(:gateway) { double }
  let(:non_customer) { create(:member) }
  let(:discount) { build(:discount, id: "foo_membership") }
  let(:rental_discount) { build(:discount, id: "bar_rental") }
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

  describe "GET  #index" do 
    it "fetches discounts" do 
      allow(BraintreeService::Discount).to receive(:get_discounts).with(gateway).and_return([discount])
      expect(BraintreeService::Discount).to receive(:get_discounts).with(gateway).and_return([discount])

      get :index, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response.first['id']).to eq(discount.id)
    end

    it "filters discount by type" do 
      discounts = [discount, rental_discount]
      allow(BraintreeService::Discount).to receive(:get_discounts).with(gateway).and_return(discounts)
      expect(BraintreeService::Discount).to receive(:get_discounts).with(gateway).and_return(discounts)
      allow(BraintreeService::Discount).to receive(:select_discounts_for_types).with(["rental"], discounts).and_return([rental_discount])
      expect(BraintreeService::Discount).to receive(:select_discounts_for_types).with(["rental"], discounts).and_return([rental_discount])
      
      get :index, params: { types: ["rental"] }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response.first['id']).to eq(rental_discount.id.to_s)
    end
  end
end
