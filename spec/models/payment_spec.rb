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
  end


  it "has a valid factory" do
    expect(build(:member)).to be_valid
  end

  context "callbacks" do
    let(:payment) { create(:payment) }

    it { expect(payment).to callback(:find_member).after(:initialize) }
  end

  context "private methods" do
    it "Finds member from payment email or name" do
      member
      name_payment = create(:payment, lastname: 'Mackley')
      email_payment = create(:payment, )
    end
    it "Properly sets subscription based on subscription_status" do
      expect(0).to eq(1)
    end
  end
end
