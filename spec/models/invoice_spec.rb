require 'rails_helper'

RSpec.describe Invoice, type: :model do

  describe "Mongoid validations" do
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'invoices') }

    it { is_expected.to have_fields(:name,
                                    :description,
                                    :resource_id,
                                    :resource_class,
                                    :plan_id,
                                    :transaction_id,
                                    :subscription_id,
                                    :discount_id).of_type(String) }
    it { is_expected.to have_field(:amount).of_type(Float) }
    it { is_expected.to have_fields(:settled_at, :refund_requested).of_type(Time) }
    it { is_expected.to have_field(:due_date).of_type(nil) }
    it { is_expected.to have_field(:created_at).of_type(Time) }
    it "sets created_at properly" do
      # within 1 hour since initializatino times can vary
      expect(build(:invoice).created_at.to_i).to be_within(60 * 60).of(Time.now.to_i)
    end
    it { is_expected.to have_field(:quantity).of_type(Integer).with_default_value_of(1) }
    it { is_expected.to have_field(:refunded).of_type(Mongoid::Boolean).with_default_value_of(false) }
    it { is_expected.to have_field(:operation).of_type(String).with_default_value_of('renew=') }
  end

  describe "ActiveModel validations" do
    it { is_expected.to validate_numericality_of(:amount) }
    it { is_expected.to validate_numericality_of(:quantity) }
    it { is_expected.to validate_presence_of(:resource_id) }
    it { is_expected.to validate_presence_of(:due_date) }
  end

  it "has a valid factory" do
    expect(build(:invoice)).to be_valid
  end

  context "validation" do
    let(:member) { create(:member) }
    let(:rental) { create(:rental) }

    it "validates resource class" do
      member_invoice = build(:invoice, resource_class: "member", resource_id: member.id)
      other_invoice = build(:invoice, resource_class: "foo")
      other_2_invoice = build(:invoice, resource_class: nil)
      rental_invoice = build(:invoice, resource_class: "rental", resource_id: rental.id)
      expect(member_invoice).to be_valid
      expect(rental_invoice).to be_valid
      expect(other_invoice).to_not be_valid
      expect(other_2_invoice).to_not be_valid
    end

    it "validates operation" do
      renew_invoice = build(:invoice)
      renew_2_invoice = build(:invoice, operation: "renew=")
      other_invoice = build(:invoice, operation: "foo")
      other_2_invoice = build(:invoice, resource_class: nil)
      expect(renew_invoice).to be_valid
      expect(renew_2_invoice).to be_valid
      expect(other_invoice).to_not be_valid
      expect(other_2_invoice).to_not be_valid
    end

    describe "validates one active invoice per resource" do
      it "validates one per member" do
        first_invoice = build(:invoice, member: member, resource_id: member.id, resource_class: "member")
        expect(first_invoice).to be_valid
        first_invoice.save
        second_invoice = build(:invoice, member: member, resource_id: member.id, resource_class: "member")
        expect(second_invoice).to_not be_valid
      end

      it "validates one per rental" do
        first_invoice = build(:invoice, member: member, resource_id: rental.id, resource_class: "rental")
        expect(first_invoice).to be_valid
        first_invoice.save
        second_invoice = build(:invoice, member: member, resource_id: rental.id, resource_class: "rental")
        expect(second_invoice).to_not be_valid
      end
    end

    it "validates resource exists" do
      rental_invoice = build(:invoice, member: member, resource_id: rental.id, resource_class: "rental")
      member_invoice = build(:invoice, member: member, resource_id: member.id, resource_class: "member")
      mixed_invoice = build(:invoice, member: member, resource_id: rental.id, resource_class: "member")
      expect(rental_invoice).to be_valid
      expect(member_invoice).to be_valid
      expect(mixed_invoice).to_not be_valid
    end
  end

  context "public methods" do
    let(:member) { create(:member) }
    let(:rental) { create(:rental) }

    describe "settlement" do
      it "has getter and setter methods for settled" do
        invoice = create(:invoice)
        expect(invoice.settled).to be_falsey
        invoice.settled = true
        expect(invoice.settled).to be_truthy
      end

      it "does not overwrite settled time" do
        timestamp_before = Time.now
        invoice = create(:invoice)
        invoice.settled = true
        timestamp_after = Time.now
        expect(invoice.settled_at).to be > timestamp_before
        expect(invoice.settled_at).to be < timestamp_after

        invoice.settled = true # Set again and make sure it's not updated
        expect(invoice.settled_at).to be < timestamp_after
      end

      it "can be reset" do
        timestamp_before = Time.now
        invoice = create(:invoice)
        invoice.settled = true
        timestamp_after = Time.now
        expect(invoice.settled_at).to be > timestamp_before
        expect(invoice.settled_at).to be < timestamp_after

        invoice.settled = false
        expect(invoice.settled_at).to be_nil
        invoice.settled = true

        invoice.settled = true # Set again and make sure it's not updated
        expect(invoice.settled_at).to be > timestamp_after
      end

      describe "submit for settlement" do
        let(:gateway) { double } # Create a fake gateway
        let(:transaction) { build(:transaction) }
        let(:first_transaction) { build(:transaction) }
        let(:success_result) { double(success?: true) }
        let(:error_result) { double(success?: false) }
        let(:invoice) { create(:invoice, member: member) }

        it "Will create a new transaction if payment method ID provided" do
          allow(BraintreeService::Transaction).to receive(:submit_invoice_for_settlement).with(gateway, invoice).and_return(transaction)
          expect(BraintreeService::Transaction).to receive(:submit_invoice_for_settlement).with(gateway, invoice).and_return(transaction)
          expect(invoice).to receive(:settle_invoice)
          expect(invoice).to_not receive(:build_next_invoice)
          result = invoice.submit_for_settlement(gateway, "1234")
          expect(result).to be(transaction)
          expect(invoice.payment_method_id).to eq("1234")
          expect(invoice.transaction_id).to eq(transaction.id)
        end

        it "Will not create a new transaction if transaction ID provided" do
          plan_invoice = create(:invoice, plan_id: "567")
          expect(plan_invoice).to receive(:settle_invoice)
          expect(plan_invoice).to receive(:build_next_invoice)
          result = plan_invoice.submit_for_settlement(nil, nil, "1234")

          expect(plan_invoice.transaction_id).to eq("1234")
          expect(result).to be(nil)
        end

        it "Cannot be settled twice" do
          settled_invoice = create(:invoice, settled_at: Time.now)
          expect { settled_invoice.submit_for_settlement(gateway, "foo") }.to raise_error(Error::UnprocessableEntity)
        end

        it "Cannot process both payment method and transaction IDs" do
          expect { invoice.submit_for_settlement(gateway, "foo", "bar") }.to raise_error(Error::UnprocessableEntity)
        end

        it "Will build another invoice even if the first doesnt settle fully" do
          plan_invoice = create(:invoice, plan_id: "567")
          existing_invoice = create(:invoice, member: member, transaction_id: first_transaction.id)
          expect(plan_invoice).to receive(:settle_invoice)
          expect(plan_invoice).to receive(:build_next_invoice)
          result = plan_invoice.submit_for_settlement(gateway, nil, transaction.id)

          expect(plan_invoice.transaction_id).to eq(transaction.id)
          expect(result).to be(nil)
        end
      end

      describe "build_next_invoice" do
        it "copys the calling invoice and resets with updated dates" do
          base_invoice = create(:invoice, settled_at: Time.now, refunded: true, due_date: Time.now, created_at: Time.now - 1.month)
          base_invoice.build_next_invoice
          new_invoice = Invoice.last
          expect(new_invoice.settled).to be_falsey
          expect(new_invoice.refunded).to be_falsey
          expect(new_invoice.past_due).to be_falsey
          expect(new_invoice.quantity).to eq(base_invoice.quantity)
        end
      end
    end

    describe "cancellation" do
      let(:member) { create(:member) }
      let(:paid_invoice) { create(:invoice, member: member, subscription_id: "foo", settled_at: Time.now) }
      let(:outstanding_invoice) { create(:invoice, member: member, name: "outstanding", subscription_id: "foo") }

      describe "Cancel by subscription id" do
        it "deletes all outstanding invoices for the canceled subscription" do
          expect {
            Invoice.process_cancellation("foo").to change(Invoice, :count).by(-1)
          }
        end
      end

      describe "Cancel by invoice" do
        it "Notifies the member and management of the cancellation" do
          expect(SlackUser).to receive(:find_by).with({ member_id: member.id }).and_return(SlackUser.new())
          expect(paid_invoice).to receive(:send_slack_message).twice
          paid_invoice.send_cancellation_notification
        end
      end
    end

    it "has getter method for past due" do
      future_invoice = create(:invoice, due_date: Time.now + 1.month)
      past_invoice = create(:invoice, due_date: Time.now - 1.month)
      expect(future_invoice.past_due).to be_falsey
      expect(past_invoice.past_due).to be_truthy
    end

    it "can fetch related resource" do
      member_invoice = create(:invoice, member: member, resource_id: member.id, resource_class: "member")
      rental_invoice = create(:invoice, member: member, resource_id: rental.id, resource_class: "rental")
      expect(member_invoice.resource).to eq(member)
      expect(rental_invoice.resource).to eq(rental)
    end

    it "programatically generates subscription IDs" do
      member_invoice = create(:invoice, member: member, resource_id: member.id, resource_class: "member")
      rental_invoice = create(:invoice, member: member, resource_id: rental.id, resource_class: "rental")
      expect(member_invoice.generate_subscription_id).to start_with("member_#{member.id}_")
      expect(rental_invoice.generate_subscription_id).to start_with("rental_#{rental.id}_")
    end

    it "can fetch current active invoice for a resource" do
      old_invoice = create(:settled_invoice, member: member, resource_id: rental.id, resource_class: "rental")
      old_invoice2 = create(:settled_invoice, member: member, resource_id: rental.id, resource_class: "rental")
      active_invoice = create(:invoice, member: member, resource_id: rental.id, resource_class: "rental")
      expect(Invoice.active_invoice_for_resource(rental.id)).to eq(active_invoice)
    end
  end


  context "private methods" do
    it "normalizes due date to time zone if set with string" do
      time = Time.now.midnight
      time_as_string = time.strftime("%Y-%m-%d")

      time_invoice = create(:invoice, due_date: time)
      timestr_invoice = create(:invoice, due_date: time_as_string)

      expect(time_invoice.due_date).to eq(timestr_invoice.due_date)
    end

    describe "delay_invoice_operation" do
      let(:invoice) { create(:invoice) }

      it "validates resource exists" do
        no_resource = build(:invoice)
        no_resource.resource_id = nil
        expect(no_resource.resource).to be(nil)
        expect { no_resource.send(:execute_invoice_operation) }.to raise_error(Error::NotFound)
      end

      it "raises error if operation invalid" do
        no_operation = build(:invoice)
        no_operation.operation = nil
        expect(no_operation.operation).to be(nil)
        expect { no_operation.send(:execute_invoice_operation) }.to raise_error(Error::UnprocessableEntity)
      end

      it "delays invoice operation if delay callback exists" do
        allow(invoice).to receive_message_chain(:resource, :delay_invoice_operation).with(invoice.operation).and_return(true)
        expect(invoice).to receive_message_chain(:resource, :delay_invoice_operation).with(invoice.operation).and_return(true)
        invoice.send(:execute_invoice_operation)
        expect(invoice.settled).to be_falsey
      end

      it "raises error if operation fails" do
        allow(invoice).to receive_message_chain(:resource, :delay_invoice_operation).with(invoice.operation).and_return(false)
        expect(invoice).to receive_message_chain(:resource, :execute_operation).with(invoice.operation, invoice).and_return(false)
        expect { invoice.send(:execute_invoice_operation) }.to raise_error(Error::UnprocessableEntity)
      end

      it "Settles the invoice if successful" do
        allow(invoice).to receive_message_chain(:resource, :delay_invoice_operation).with(invoice.operation).and_return(false)
        expect(invoice).to receive_message_chain(:resource, :delay_invoice_operation).with(invoice.operation).and_return(false)
        expect(invoice).to receive_message_chain(:resource, :execute_operation).with(invoice.operation, invoice).and_return(true)
        expect(invoice).to receive_message_chain(:resource, :send_renewal_slack_message)
        invoice.send(:execute_invoice_operation)
        expect(invoice.settled).to be_truthy
      end
    end
  end
end