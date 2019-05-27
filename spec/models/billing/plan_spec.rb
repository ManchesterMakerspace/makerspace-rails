require 'rails_helper'

RSpec.describe BraintreeService::Plan, type: :model do
  let(:gateway) { double } # Create a fake gateway
  let(:fake_plan) { double(id: "foo") }

  it "has a factory" do
    expect(build(:plan)).to be_truthy
  end

  context "public methods" do
    describe "#get_plans" do
      it "fetches all plans" do 
        allow(gateway).to receive_message_chain(:plan, :all, map: [fake_plan])
        expect(BraintreeService::Plan.get_plans(gateway)).to eq([fake_plan])
      end
    end

    describe "#select plans for types" do 
      let(:membership_plan) { double(id: "membership") }
      let(:rental_plan) { double(id: "rental") }

      before(:each) do 
        allow(BraintreeService::Plan).to receive(:get_membership_plans).and_return([membership_plan])
        allow(BraintreeService::Plan).to receive(:get_rental_plans).and_return([rental_plan])
      end

      it "can fetch plans by type" do 
        plans = [membership_plan, rental_plan]
        expect(BraintreeService::Plan.select_plans_for_types(["member"], plans)).to eq([membership_plan])
        expect(BraintreeService::Plan.select_plans_for_types(["rental"], plans)).to eq([rental_plan])
        expect(BraintreeService::Plan.select_plans_for_types(["foo"], plans)).to eq([])
      end

      describe "#get_membership_plans" do 
        it "filters plans by ID" do 
          plans = [membership_plan, rental_plan]
          expect(BraintreeService::Plan.get_membership_plans(plans)).to eq([membership_plan])
        end
      end

      describe "#get_rental_plans" do 
        it "filters plans by ID" do 
          plans = [membership_plan, rental_plan]
          expect(BraintreeService::Plan.get_rental_plans(plans)).to eq([rental_plan])
        end
      end
    end
  end
end