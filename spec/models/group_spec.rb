require 'rails_helper'

RSpec.describe Group, type: :model do
  let(:group) { build(:group) }

  describe "Mongoid validations" do
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'groups') }

    it { is_expected.to have_field(:groupRep) }
    it { is_expected.to have_field(:groupName).of_type(String) }
    it { is_expected.to have_field(:expiry).of_type(Integer) }
  end

  describe "ActiveModel validations" do
    it { is_expected.to belong_to(:member).with_foreign_key("groupRep") }
    it { is_expected.to have_many(:active_members).as_inverse_of(:group).with_foreign_key("groupName")}

    # with_primary_key being released in next version of RSpec
    # it { is_expected.to belong_to(:member).with_primary_key("fullname").with_foreign_key("groupRep") }
    # it { is_expected.to have_many(:active_members).with_primary_key("groupName").as_inverse_of(:group).with_foreign_key("groupName")}
  end

  describe "callbacks" do
    it { expect(group).to callback(:update_active_members).after(:update) }
    it { expect(group).to callback(:update_active_members).after(:create) }
  end

  describe "private methods" do
    it "Updates group expiration and access card" do
      expired_member = create(:member, :expired)
      card = create(:card, member: expired_member)
      group = create(:group, groupRep: expired_member)
      renewal_hash = {
        months: 1
      }
      group_expiration = group.expiry #multiply by 1000 bc js used ms instead of seconds
      expect(expired_member.expirationTime).to eq(group_expiration)
      expect(card.expiry).to eq(group_expiration)
    end
  end
end
