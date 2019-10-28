require 'rails_helper'

RSpec.describe Rental, type: :model do
  describe "Mongoid validations" do
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'rentals') }

    it { is_expected.to have_fields(:number, :expiration) }
    it { is_expected.to belong_to(:member) }
  end

  describe "ActiveModel validations" do
    it { is_expected.to belong_to(:member) }
    it { is_expected.to validate_presence_of(:number) }
    it { is_expected.to validate_uniqueness_of(:number) }
  end

  it "has a valid factory" do
    expect(build(:rental)).to be_valid
  end

  describe "on destroy" do 
    it "cancels its subscription if subscription_id exists" do 
      rental = create(:rental, subscription_id: "124")
      expect(BraintreeService::Subscription).to receive(:cancel).with(anything, "124")
      rental.destroy
    end
  
    it "Doesnt touch subscription if subscription_id doesn't exist" do 
      rental = create(:rental)
      expect(BraintreeService::Subscription).not_to receive(:cancel).with(anything, "124")
      rental.destroy
    end
  end
end
