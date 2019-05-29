require 'rails_helper'

#https://github.com/mongoid/mongoid-rspec

RSpec.describe Member, type: :model do


  describe "Mongoid validations" do
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'members') }

    it { is_expected.to have_fields(:cardID, :firstname, :lastname, :groupName) }
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
    it { is_expected.to validate_presence_of(:firstname) }
    it { is_expected.to validate_presence_of(:lastname) }
    it { is_expected.to validate_uniqueness_of(:email) }
    it { is_expected.to have_many(:access_cards).as_inverse_of(:member) }
  end

  it "has a valid factory" do
    expect(build(:member)).to be_valid
  end

  # Need this because we store things in milliseconds instead of ruby seconds
  def conv_to_ms(time)
    time.to_i * 1000
  end

  context "public methods" do
    let(:member) { create(:member) }
    let(:expired_member) { create(:member, :expired) }
    let(:expired_card) { create(:card, member: expired_member) }

    describe "Renewing members" do
      it "Adds renewal to Now if member is expired" do
        one_month_later = Time.now + 1.month;
        expired_member.send(:renew=, 1)
        one_month_later_after = Time.now + 1.month;
        # We can't assert the exact time since we measure in ms, the expectation may be off by the
        # assertion by just a few ms. So we define before and after the call, and make sure the result is
        # within those bounds
        expect(expired_member.expirationTime).to be >= conv_to_ms(one_month_later)
        expect(expired_member.expirationTime).to be <= conv_to_ms(one_month_later_after)
      end

      it "Extends membership if not expired" do
        initial_expiration = member.pretty_time
        member.send(:renew=, 10)
        expected_renewal = conv_to_ms(initial_expiration + 10.months)
      end

      it "Lost or stolen card is not reactivated by renewal" do
        expired_card.card_location = "lost"
        expired_card.save

        expect(expired_card.validity).to eq('lost')
        expired_member.send(:renew=, 1)
        new_expiration = expired_member.expirationTime
        expired_card.reload
        expect(expired_card.validity).to eq('lost')
        expect(expired_card.expiry).to eq(new_expiration)
      end
    end

    # TODO subscription helpers

    describe "permissions" do
      it "determines if member is allowed by permission" do
        enabled_permission = build(:permission, name: :foo, enabled: true, member_id: nil)
        enabled_permission_2 = build(:permission, name: :bar, enabled: true, member_id: nil)
        disabled_permission = build(:permission, name: :foo, enabled: false, member_id: nil)
        disabled_permission_2 = build(:permission, name: :bar, enabled: false, member_id: nil)
        allowed_member = create(:member, permissions: [enabled_permission, enabled_permission_2] )
        disallowed_member = create(:member, permissions: [disabled_permission, disabled_permission_2] )
        expect(allowed_member.is_allowed?(:foo)).to be_truthy
        expect(allowed_member.is_allowed?(:bar)).to be_truthy
        expect(disallowed_member.is_allowed?(:foo)).to be_falsy
        expect(disallowed_member.is_allowed?(:bar)).to be_falsy
      end

      it "gets permissions for user" do
        enabled_permission = build(:permission, name: :bar, enabled: true, member_id: nil)
        disabled_permission = build(:permission, name: :foo, enabled: false, member_id: nil)
        member = create(:member, permissions: [enabled_permission, disabled_permission] )
        expect(member.get_permissions).to eq({ foo: false, bar: true })
      end

      it "upserts permissions for user" do
        enabled_permission = build(:permission, name: :bar, enabled: true, member_id: nil)
        member = create(:member, permissions: [enabled_permission] )
        expect(member.get_permissions).to eq({ bar: true })
        expect(Permission.all.size).to eq(1)

        member.update_permissions({ bar: false, foo: true })
        member.reload
        expect(member.get_permissions).to eq({ foo: true, bar: false })
        expect(Permission.all.size).to eq(2)
      end

      it "applies default permissions to user" do 
        permission1 = create(:default_permission, name: :foo, enabled: false)
        permission2 = create(:default_permission, name: :bar, enabled: true)
        member = create(:member)
        member.reload
        expect(member.get_permissions).to eq({ bar: true, foo: false })
      end
    end
  end

  context "Callbacks" do
    describe "on create" do
      it "sends a slack invite" do
        member = build(:member)
        expect(member).to receive(:invite_to_slack)
        member.save
      end

      it "sends a google drive invite" do
        member = build(:member)
        expect(member).to receive(:invite_gdrive).with(member.email)
        member.save

        other_member = build(:member)
        expect(other_member).to receive(:invite_gdrive).with(other_member.email).and_raise(Error::Google::Upload)
        expect(other_member).to receive(:send_slack_message).with(/sharing/)
        other_member.save
      end
    end

    describe "on update" do
      let(:member) { create(:member) }
      let(:expired_member) { create(:member, :expired) }
      let(:expired_card) { create(:card, member: expired_member) }

      it "Updates access card expiration" do
        first_expiration = expired_member.expirationTime
        expect(expired_card.expiry).to eq(first_expiration)

        expired_member.update({ expirationTime: first_expiration + 10})
        expect(expired_card.expiry).to eq(first_expiration + 10)
      end
    end
  end
end
