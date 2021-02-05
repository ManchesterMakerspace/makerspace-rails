require 'rails_helper'

RSpec.describe RejectionCard, type: :model do
  describe "Mongoid validations" do
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'rejections') }

    it { is_expected.to have_field(:uid) }
    it { is_expected.to have_fields(:holder, :validity).of_type(String) }
    it { is_expected.to have_field(:timeOf).of_type(DateTime) }
  end

  it "has a valid factory" do
    expect(build(:rejection_card)).to be_valid
  end
end
