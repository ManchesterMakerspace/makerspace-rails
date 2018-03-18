require 'rails_helper'

RSpec.describe RegistrationToken, type: :model do
  describe "Mongoid validations" do
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'registration_tokens') }

    it { is_expected.to have_fields(:token, :email).of_type(String) }
    it { is_expected.to have_field(:months).of_type(Integer) }
    it { is_expected.to have_field(:role).of_type(String).with_default_value_of("member") }
    it { is_expected.to have_field(:used).of_type(Mongoid::Boolean).with_default_value_of(false) }
  end

  describe "ActiveModel validations" do
    it { is_expected.to validate_presence_of(:email) }

    context "custom validation" do
      it "Token not valid if Member w/ that email exists" do
        member = create(:member, email: 'token@rspec.com')
        token = build(:registration_token, email: 'token@rspec.com')
        expect(token).not_to be_valid
      end
    end
  end

  context "callbacks" do
    let(:registration_token) { create(:registration_token) }

    it { expect(registration_token).to callback(:generate_token).after(:create) }
  end

  context "private methods" do
    let(:registration_token) { create(:registration_token) }

    it "generates a token when created" do
      expect(registration_token.token).to be_instance_of(String)
    end
  end
end
