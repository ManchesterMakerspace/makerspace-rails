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
    it { is_expected.to have_field(:silence_emails).of_type(Mongoid::Boolean) }
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
        expect(member.expirationTime).to eq(expected_renewal)
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

    describe "invoicing" do
      it "delays renewal if no access cards exist" do
        active_member = create(:member, access_cards: create_list(:card, 1))
        expect(member.delay_invoice_operation(:renew=)).to be_truthy
        expect(active_member.delay_invoice_operation(:renew=)).to be_falsy
      end

      it "settles invoices on first access card" do
        invoice_1 = create(:invoice, member: member, transaction_id: "123", quantity: 3)
        initial_expiration = member.pretty_time
        Card.create(uid: "1234", member: member)
        member.reload
        expected_renewal = conv_to_ms(initial_expiration + 3.months)
        expect(member.expirationTime).to eq(expected_renewal)
      end
    end

    describe "address_setter" do 
      it "unpacks and saves address hash as attributes" do 
        member = create(:member)
        address_hash = {
          street: "foo",
          unit: "1",
          city: "bar",
          state: "NH",
          postal_code: "90210"
        }
        member.address = address_hash
        member.reload
        expect(member.address_street).to eq(address_hash[:street])
        expect(member.address_unit).to eq(address_hash[:unit])
        expect(member.address_city).to eq(address_hash[:city])
        expect(member.address_state).to eq(address_hash[:state])
        expect(member.address_postal_code).to eq(address_hash[:postal_code])
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
      it "schedules a slack and google drive invite" do
        member = build(:member)
        expect_any_instance_of(Service::GoogleDrive).to receive(:invite_gdrive).with(member.email)
        expect_any_instance_of(Service::SlackConnector).to receive(:invite_to_slack).with(
          member.email, 
          member.lastname,
          member.firstname, 
        )
        member.save!
      end
    end

    describe "on update" do
      let(:gateway) { double }
      let(:member) { create(:member) }
      let(:expired_member) { create(:member, :expired) }
      let(:expired_card) { create(:card, member: expired_member) }

      it "Updates access card expiration" do
        first_expiration = expired_member.expirationTime
        expect(expired_card.expiry).to eq(first_expiration)

        expired_member.update({ expirationTime: first_expiration + 10})
        expect(expired_card.expiry).to eq(first_expiration + 10)
      end

      it "Doesn't reinvite for normal changes" do
        # Mock this publish so Slack tracking only applies to update and not create
        allow(member).to receive(:publish_create)
        expect_any_instance_of(Service::GoogleDrive).not_to receive(:invite_gdrive)
        expect_any_instance_of(Service::SlackConnector).not_to receive(:invite_to_slack)
        member.update!({ firstname: "foo_changed" })
      end

      it "Reinvites to services if email changes" do
        # Mock this publish so Slack tracking only applies to update and not create
        allow(member).to receive(:publish_create)
        new_email = "foo_changed@test.com"
        expect_any_instance_of(Service::GoogleDrive).to receive(:invite_gdrive).with(new_email)
        expect_any_instance_of(Service::SlackConnector).to receive(:invite_to_slack).with(
          new_email, 
          member.lastname,
          member.firstname, 
        )
        member.update!({ email: new_email })
      end

      it "Updates billing if a customer" do 
        customer = create(:member, customer_id: "foo")
        allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
        mock_customer_chain = double 
        expect(gateway).to receive(:customer).and_return(mock_customer_chain)
        expect(mock_customer_chain).to receive(:update).with(
          "foo", 
          first_name: "foo_changed", 
          last_name: customer.lastname
        )
        customer.update!({ firstname: "foo_changed" })
      end

      it "Doesn't update billing if not a customer" do 
        allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
        expect(gateway).not_to receive(:customer)
        member.update!({ firstname: "foo_changed" })
      end
    end

    describe "on destroy" do 
      it "cancels its subscription if subscription_id exists" do 
        member = create(:member, subscription_id: "124")
        expect(BraintreeService::Subscription).to receive(:cancel).with(anything, "124")
        member.destroy
      end
    
      it "Doesnt touch subscription if subscription_id doesn't exist" do 
        member = create(:member)
        expect(BraintreeService::Subscription).not_to receive(:cancel).with(anything, "124")
        member.destroy
      end

      it "Deletes rentals if rentals exists" do 
        member = create(:member)
        create(:rental, member: member)
        create(:rental, member: member)
        expect(Rental.all.length).to eq(2)
        member.destroy
        expect(Rental.all.length).to eq(0)
      end
    end
  end
end
