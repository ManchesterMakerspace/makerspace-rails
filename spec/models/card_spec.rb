require 'rails_helper'

RSpec.describe Card, type: :model do
  describe "Mongoid validations" do
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'cards') }

    it { is_expected.to have_field(:uid) }
    it { is_expected.to have_fields(:holder, :validity).of_type(String) }
    it { is_expected.to have_field(:expiry).of_type(Integer) }
  end

  describe "ActiveModel validations" do
    it { is_expected.to validate_presence_of(:uid) }
    it { is_expected.to validate_uniqueness_of(:uid) }

    it { is_expected.to belong_to(:member).as_inverse_of(:access_cards) }
  end

  it "has a valid factory" do
    expect(build(:card)).to be_valid
  end

  # context "callbacks" do
  #   let(:card) { create(:card) }

  #   it { expect(card).to callback(:set_expiration).before(:create) }
  #   it { expect(card).to callback(:set_expiration).before(:update) }
  #   it { expect(card).to callback(:set_holder).before(:create) }
  # end

  context "private methods" do
    let(:member) {create(:member, :current)}
    let(:expired_member) {create(:member, :expired)}
    let(:card) {create(:card, member: member)}
    let(:expired_card) {create(:card, member: expired_member)}

    it "Sets holder, expiry and validty from member" do
      expect(card.holder).to eq(member.fullname)
      expect(card.expiry).to eq(member.expirationTime)
      expect(card.validity).to eq(member.status)
    end

    it "Renewed member renews card" do
      expect(expired_card.expiry).to be < (Time.now.to_i * 1000)
      expired_member.send(:renewal=, 1)
      expect(expired_card.expiry).to eq(expired_member.expirationTime)
    end

    it "Lost or stolen card is not reactivated by renewal" do
      expired_card.card_location = "lost"
      expired_card.save

      expect(expired_card.validity).to eq('lost')
      expired_member.send(:renewal=, 1)
      expect(expired_card.validity).to eq('lost')
    end
  end
end
