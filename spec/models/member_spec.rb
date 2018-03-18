require 'rails_helper'

#https://github.com/mongoid/mongoid-rspec

RSpec.describe Member, type: :model do
  let(:member) { build(:member) }

  describe "Mongoid validations" do
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'members') }

    it { is_expected.to have_fields(:cardID, :fullname, :groupName) }
    it { is_expected.to have_field(:status).with_default_value_of('activeMember') }
    it { is_expected.to have_field(:expirationTime).of_type(Integer) }
    it { is_expected.to have_field(:role).with_default_value_of('member') }
    it { is_expected.to have_field(:memberContractOnFile).of_type(Mongoid::Boolean) }
    it { is_expected.to have_field(:subscription).of_type(Mongoid::Boolean).with_default_value_of(false) }
    it { is_expected.to have_fields(:email, :encrypted_password).of_type(String).with_default_value_of("") }
    it { is_expected.to have_field(:reset_password_token).of_type(String) }
    it { is_expected.to have_fields(:reset_password_sent_at, :remember_created_at).of_type(Time) }
  end

  describe "ActiveModel validations" do
    it { is_expected.to validate_presence_of(:fullname) }
    it { is_expected.to validate_uniqueness_of(:fullname) }
    it { is_expected.to validate_uniqueness_of(:email) }
    it { is_expected.to have_many(:access_cards).as_inverse_of(:member) }
    it { is_expected.to belong_to(:group).as_inverse_of(:active_members).with_foreign_key("groupName") }

    # with_primary_key being released in next version of RSpec
    # it { is_expected.to belong_to(:group).with_primary_key("groupName").as_inverse_of(:active_members).with_foreign_key("groupName") }
  end

  it "has a valid factory" do
    expect(build(:member)).to be_valid
  end

  context "callbacks" do
    it { expect(member).to callback(:update_allowed_workshops).before(:save) }
    it { expect(member).to callback(:verify_group_expiry).after(:initialize) }
    it { expect(member).to callback(:update_card).after(:update) }
  end

  context "public methods" do
    let(:expired_member) { create(:member, :expired) }
    let(:valid_member) { create(:member, :current) }
    let(:expiring_member) { create(:member, :expiring) }

    it "Retrieves the correct active members" do
      members = [expired_member, valid_member, expiring_member]
      expect(Member.active_members.to_a).to include(valid_member, expiring_member)
    end

    it "Retrieves the correct expiring members" do
      members = [expired_member, valid_member, expiring_member]
      expect(Member.expiring_members.to_a).to include(expiring_member)
    end

    it "Correctly parses expirationTime" do
      expect(expired_member.membership_status).to eq('expired')
      expect(expired_member.send(:duration)).to be_within(1.day).of(-20.days.to_i)

      expect(valid_member.membership_status).to eq('current')
      expect(valid_member.send(:duration)).to be_within(1.day).of(20.days.to_i)

      expect(expiring_member.membership_status).to eq('expiring')
      expect(expiring_member.send(:duration)).to be_within(1.day).of(5.days.to_i)
    end

    describe "Renewing members" do #method to be improved
      it "Will not renew a member if a time is not a hash" do
        expired_member.send(:renewal=, 1)
        expect(expired_member.membership_status).to eq('expired')
      end

      it "Will renew a member with the number of months" do
        renewal_hash = {
          months: 1
        }
        expired_member.send(:renewal=, renewal_hash)
        expect(expired_member.membership_status).to eq('current')
      end
    end

    it "Updates access card" do
      card = create(:card, member: expired_member)
      renewal_hash = {
        months: 1
      }
      first_expiration = expired_member.expirationTime
      expect(card.expiry).to eq(first_expiration)

      expired_member.send(:renewal=, renewal_hash)
      new_expiration = expired_member.expirationTime
      expect(card.expiry).to eq(new_expiration)
      expect(new_expiration).not_to eq(first_expiration)
    end
  end
end
