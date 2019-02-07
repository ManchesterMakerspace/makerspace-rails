require 'rails_helper'

RSpec.describe Rental, type: :model do
  describe "Mongoid validations" do
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'rentals') }

    it { is_expected.to have_fields(:number, :expiration) }
  end

  describe "ActiveModel validations" do
    it { is_expected.to belong_to(:member) }
    it { is_expected.to validate_presence_of(:number) }
    it { is_expected.to validate_uniqueness_of(:number) }
  end

  it "has a valid factory" do
    expect(build(:rental)).to be_valid
  end

  context "Callbacks" do
    describe "on update" do
      let(:rental) { create(:rental) }

      it "Sends a slack notification about the change" do
        expect(rental).to receive(:send_slack_message).with(/renewed/)
        rental.send(:renew=, 1)
        expect(rental).to receive(:send_slack_message).with(/updated/)
        rental.update({ number: "Foo" })
      end
    end
  end
end
