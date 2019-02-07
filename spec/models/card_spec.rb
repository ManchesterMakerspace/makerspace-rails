require 'rails_helper'

RSpec.describe Card, type: :model do
    let(:member) {create(:member, :current)}
    let(:card) {create(:card, member: member)}

    let(:expired_member) {create(:member, :expired)}
    let(:expired_card) {create(:card, member: expired_member)}

    let(:inacitve_member) {create(:member, :inactive)}
    let(:inactive_card) {create(:card, member: inacitve_member)}

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

  context "public methods" do
    it "Correctly identifies is_active" do
      expect(card.is_active?).to be_truthy
      expect(expired_card.is_active?).to be_truthy
      expect(inactive_card.is_active?).to be_falsy
    end
  end


  context "Callbacks" do
    describe "on create" do
      it "Sets holder, expiry and validty from member" do
        expect(card.holder).to eq(member.fullname)
        expect(card.expiry).to eq(member.expirationTime)
        expect(card.validity).to eq(member.status)
      end

      it "Updates rejection card where uid came from" do
        rejection_card = create(:rejection_card, { uid: "123" })
        expect(rejection_card.holder).to eq(nil)
        card = create(:card, uid: "123", member: member)
        rejection_card.reload
        expect(rejection_card.holder).to eq(member.fullname)
      end
    end

    describe "on update" do
      it "Updates expiry and validity from member" do
        card.update({ member: expired_member})
        expect(card.expiry).to eq(expired_member.expirationTime)
        expect(card.validity).to eq(expired_member.status)
      end
    end
  end
end
