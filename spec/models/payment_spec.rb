require 'rails_helper'

RSpec.describe Payment, type: :model do
  describe "Mongoid validations" do
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'payments') }

    it { is_expected.to have_fields(:product, :firstname, :lastname, :currency, :status, :payment_date, :payer_email, :address, :txn_id, :txn_type) }
    it { is_expected.to have_field(:amount).of_type(Float) }
    it { is_expected.to have_field(:test).of_type(Mongoid::Boolean) }
  end

  describe "ActiveModel validations" do
    it { is_expected.to belong_to(:member) }
    it { is_expected.to validate_presence_of(:txn_id) }
    it { is_expected.to validate_uniqueness_of(:txn_id) }
  end

  it "has a valid factory" do
    expect(build(:payment)).to be_valid
  end

  context "callbacks" do
    let(:payment) { create(:payment) }

    it { expect(payment).to callback(:find_member).after(:initialize) }
  end

  context "private methods" do
    it "Finds member from payment email or name" do
      member = create(:member, firstname: "New", lastname: 'Member')
      incorrect_member = create(:member, firstname: "Wrong", lastname: 'User', email: 'wrong_email@gmail.com')
      email_member = create(:member, firstname: "Test", lastname: 'Tester', email: 'test@gmail.com')
      name_payment = create(:payment, lastname: 'Member')
      email_payment = create(:payment, payer_email: 'test@gmail.com')
      name_payment.reload
      email_payment.reload
      expect(name_payment.member).to eq(member)
      expect(email_payment.member).to eq(email_member)
    end
    it "Properly sets subscription based on subscription_status" do
      member = create(:member, firstname: "Test", lastname: 'Member')
      name_payment = create(:payment, :sub_payment, lastname: 'Member')
      name_payment.reload
      expect(name_payment.member).to eq(member)
      member.reload
      expect(member.subscription).to be_truthy

      cancel_payment = create(:payment, :sub_cancel, lastname: 'Member')
      cancel_payment.reload
      expect(cancel_payment.member).to eq(member)
      member.reload
      expect(member.subscription).to be_falsey

      other_payment = create(:payment, :sub_payment, lastname: 'Member')
      other_payment.reload
      expect(other_payment.member).to eq(member)
      member.reload
      expect(member.subscription).to be_truthy

      failed_payment = create(:payment, :subscr_failed, lastname: 'Member')
      failed_payment.reload
      expect(failed_payment.member).to eq(member)
      member.reload
      expect(member.subscription).to be_falsey
    end
  end
end
