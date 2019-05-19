require 'rails_helper'

RSpec.describe BraintreeService::Notification, type: :model do

  # TODO need to mock the incoming notification

  describe "Mongoid validations" do 
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'braintree__notifications') }

    it { is_expected.to have_fields(:kind, :payload).of_type(String) }
    it { is_expected.to have_field(:timestamp).of_type(Date) }
  end 

  it "has a valid factory" do
    expect(build(:notification)).to be_valid
  end

  describe "process" do 
    it "reads notification and stores in db" do 
    end

    it "processes subscription payment or dispute" do 
    end
  end

  describe "process subscription" do
  end
end