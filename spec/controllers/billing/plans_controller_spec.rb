require 'rails_helper'

RSpec.describe Billing::PlansController, type: :controller do
  let(:gateway) { double }
  let(:non_customer) { create(:member) }
  let(:membership_plan) { build(:plan, id: "membership_plan") }
  let(:rental_plan) { build(:plan, id: "rental_plan") }
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
    it "fetches plans" do 
      plans = [membership_plan, rental_plan]
      allow(BraintreeService::Plan).to receive(:get_plans).with(gateway).and_return(plans)
      expect(BraintreeService::Plan).to receive(:get_plans).with(gateway).and_return(plans)
      expect(BraintreeService::Plan).not_to receive(:select_plans_for_types)

      get :index, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response.first['id']).to eq(membership_plan.id.to_s)
    end

    it "filters plans by type" do 
      plans = [membership_plan, rental_plan]
      allow(BraintreeService::Plan).to receive(:get_plans).with(gateway).and_return(plans)
      expect(BraintreeService::Plan).to receive(:get_plans).with(gateway).and_return(plans)
      allow(BraintreeService::Plan).to receive(:select_plans_for_types).with(["rental"], plans).and_return([rental_plan])
      expect(BraintreeService::Plan).to receive(:select_plans_for_types).with(["rental"], plans).and_return([rental_plan])
      
      get :index, params: { types: ["rental"] }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(parsed_response.first['id']).to eq(rental_plan.id.to_s)
    end
  end
end
