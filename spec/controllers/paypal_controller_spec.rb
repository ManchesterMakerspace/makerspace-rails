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
      before(:each) do
        member
        Redis.current.flushall
        sleep(5.seconds)
      end 
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

      it "Sends a notification to Slack" do
        expect(SlackMessagesJob).to receive(:perform_later)
        post :notify, params: valid_attributes, format: :json
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
        ActiveJob::Base.queue_adapter = :test
        post :notify, params: valid_attributes, format: :json
        expect {
          post :notify, params: valid_attributes, format: :json
        }.to have_enqueued_job
        messages = Redis.current.mget(*Redis.current.keys)
        sorted_messages = messages.sort_by { |payload| Time.parse(JSON.load(payload)["timestamp"]) }
        expect(JSON.load(sorted_messages.last)["message"]).to include("Txn is already taken")
      end
    end
  end
end
