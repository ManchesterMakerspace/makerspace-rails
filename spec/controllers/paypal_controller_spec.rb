require 'rails_helper'
require 'securerandom'

RSpec.describe PaypalController, type: :controller do

  let(:member) { create(:member) }
  let(:valid_attributes) {
    {
      item_name: '1-month Subscription',
      item_number: 'Sub-Stnd-Membership',
      first_name: 'firstname',
      last_name: 'lastname',
      mc_gross: "65.0",
      mc_currency: "USD",
      payment_status: 'Completed',
      payer_email: member.email,
      txn_type: 'cart',
      txn_id: SecureRandom.uuid
    }
  }

  describe "POST #notify" do
    context "with valid params" do
      it "creates a new Paypal" do
        expect {
          post :notify, params: valid_attributes, format: :json
        }.to change(Payment, :count).by(1)
      end

      it "assigns a newly created paypal as @paypal" do
        post :notify, params: valid_attributes, format: :json
        expect(assigns(:payment)).to be_a(Payment)
        expect(assigns(:payment)).to be_persisted
      end

      it "assigns an array of messages for Slack" do
        post :notify, params: valid_attributes, format: :json
        expect(assigns(:messages)).to be_a(Array)
        expect(assigns(:messages).first).to include("Payment Completed:")
        expect(assigns(:messages).first).to include("Member found:")
      end

      it "Sends a notification to Slack" do
        post :notify, params: valid_attributes, format: :json
        expect(assigns(:notifier)).to be_a(Slack::Notifier)
      end

      it "Attributes the correct member to the payment" do
        post :notify, params: valid_attributes, format: :json
        expect(assigns(:payment).member).to eq(member)
      end

      it "Updates member to subscription for correct txn_type" do
        expect(member.subscription).to be_falsey
        valid_attributes[:txn_type] = "subscr_payment"
        post :notify, params: valid_attributes, format: :json
        member.reload
        expect(member.subscription).to be_truthy
      end

      it "Updates member off subscription for correct txn_type" do
        expect(member.subscription).to be_falsey
        valid_attributes[:txn_type] = "subscr_payment"
        post :notify, params: valid_attributes, format: :json
        member.reload
        expect(member.subscription).to be_truthy
        valid_attributes[:txn_type] = "subscr_cancel"
        valid_attributes[:txn_id] = SecureRandom.uuid
        post :notify, params: valid_attributes, format: :json
        member.reload
        expect(member.subscription).to be_falsey
      end

      it "Notifies of duplicate txn_ids" do
        post :notify, params: valid_attributes, format: :json
        post :notify, params: valid_attributes, format: :json
        expect(assigns(:messages).last).to include("Txn is already taken")
      end
    end
  end
end
