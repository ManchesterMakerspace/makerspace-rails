require 'rails_helper'

RSpec.describe BraintreeService::Transaction, type: :model do
  let(:gateway) { double } # Create a fake gateway
  let(:success_result) { double(success?: true) }
  let(:error_result) { double(success?: false) }
  let(:fake_transaction) { double(id: "foo") }

  context "public methods" do
    describe "#refund" do
      transaction_id = "foo"

      it "raises error if failed result" do
        allow(gateway).to receive_message_chain(:transaction, refund: error_result) # Setup method calls to gateway
        allow(Error::Braintree::Result).to receive(:new).with(error_result).and_return(Error::Braintree::Result.new) # Bypass error instantiation

        expect(gateway.transaction).to receive(:refund).with(transaction_id).and_return(error_result)
        expect{ BraintreeService::Transaction.refund(gateway, transaction_id) }.to raise_error(Error::Braintree::Result)
      end

      it "sets invoice to refunded if successful" do
        invoice = create(:invoice, transaction_id: transaction_id, refunded: false)

        allow(gateway).to receive_message_chain(:transaction, refund: success_result) # Setup method calls to gateway
        allow(success_result).to receive(:transaction).and_return(fake_transaction)
        allow(BraintreeService::Transaction).to receive(:normalize).with(gateway, fake_transaction).and_return(fake_transaction)
        allow(fake_transaction).to receive(:invoice).and_return(invoice)

        expect(gateway.transaction).to receive(:refund).with(transaction_id).and_return(success_result)
        result_transaction = BraintreeService::Transaction.refund(gateway, transaction_id)
        expect(result_transaction).to eq(fake_transaction)

        invoice.reload
        expect(invoice.refunded).to be(true)
      end

      it "reports refund and sends receipt" do
        invoice = create(:invoice, transaction_id: transaction_id, refunded: false)

        allow(gateway).to receive_message_chain(:transaction, refund: success_result) # Setup method calls to gateway
        allow(success_result).to receive(:transaction).and_return(fake_transaction)
        allow(BraintreeService::Transaction).to receive(:normalize).with(gateway, fake_transaction).and_return(fake_transaction)
        allow(fake_transaction).to receive(:invoice).and_return(invoice)

        expect(gateway.transaction).to receive(:refund).with(transaction_id).and_return(success_result)

        allow(BillingMailer).to receive_message_chain(:refund, :deliver_later)
        expect(BillingMailer).to receive(:refund).with(invoice.member.email, fake_transaction.id, invoice.id)
        expect(BraintreeService::Transaction).to receive(:send_slack_message).with(/refund .+ completed/i)
        BraintreeService::Transaction.refund(gateway, transaction_id)
      end
    end

    describe "#get_transactions" do
      it "fetches transactions" do
        allow(gateway).to receive_message_chain(:transaction, search: [fake_transaction]) # Setup method calls to gateway
        expect(gateway.transaction).to receive(:search).and_return([fake_transaction])
        allow(BraintreeService::Transaction).to receive(:normalize).with(gateway, fake_transaction).and_return(fake_transaction)

        result = BraintreeService::Transaction.get_transactions(gateway)
        expect(result).to eq([fake_transaction])
      end
    end

    describe "#get_transaction" do
      it "fetches a transaction" do
        allow(gateway).to receive_message_chain(:transaction, find: fake_transaction) # Setup method calls to gateway
        expect(gateway.transaction).to receive(:find).with("foo").and_return(fake_transaction)
        allow(BraintreeService::Transaction).to receive(:normalize).with(gateway, fake_transaction).and_return(fake_transaction)

        result = BraintreeService::Transaction.get_transaction(gateway, "foo")
        expect(result).to eq(fake_transaction)
      end
    end

    describe "#submit_invoice_for_settlement" do
      describe "subscription invoice" do
        let(:member) { create(:member) }
        let(:invoice) { create(:invoice, plan_id: "foo", member: member) }

        it "creates a new subscription" do
          subscription = double(id: "foobar", transactions: [fake_transaction]) # Mock new subscription
          # Setup calls
          allow(BraintreeService::Subscription).to receive(:create).with(gateway, invoice).and_return(subscription)
          allow(subscription).to receive_message_chain(:transactions, :first).and_return(fake_transaction)
          allow(BraintreeService::Transaction).to receive(:normalize).with(gateway, fake_transaction).and_return(fake_transaction)

          result_transaction = BraintreeService::Transaction.submit_invoice_for_settlement(gateway, invoice)
          expect(result_transaction).to eq(fake_transaction)

          invoice.reload
          expect(invoice.subscription_id).to eq(subscription.id)
          expect(invoice.transaction_id).to eq(fake_transaction.id)
        end

        it "reports payment and sends a receipt" do
          subscription = double(id: "foobar", transactions: [fake_transaction]) # Mock new subscription
          # Setup calls
          allow(BraintreeService::Subscription).to receive(:create).with(gateway, invoice).and_return(subscription)
          allow(subscription).to receive_message_chain(:transactions, :first).and_return(fake_transaction)
          allow(BraintreeService::Transaction).to receive(:normalize).with(gateway, fake_transaction).and_return(fake_transaction)

          allow(BillingMailer).to receive_message_chain(:receipt, :deliver_later)
          expect(BillingMailer).to receive(:receipt).with(invoice.member.email, fake_transaction.id, invoice.id)
          expect(BraintreeService::Transaction).to receive(:send_slack_message).with(/received for #{invoice.name}/i)
          BraintreeService::Transaction.submit_invoice_for_settlement(gateway, invoice)
        end

        it "Sets associated member to subscription" do
          subscription = double(id: "foobar", transactions: [fake_transaction]) # Mock new subscription
          # Setup calls
          allow(BraintreeService::Subscription).to receive(:create).with(gateway, invoice).and_return(subscription)
          allow(subscription).to receive_message_chain(:transactions, :first).and_return(fake_transaction)
          allow(BraintreeService::Transaction).to receive(:normalize).with(gateway, fake_transaction).and_return(fake_transaction)

          result_transaction = BraintreeService::Transaction.submit_invoice_for_settlement(gateway, invoice)
          expect(member.subscription_id).to eq("foobar")
        end
      end

      describe "non-subscription invoice" do
        let(:invoice) { create(:invoice) }
        it "creates a new transaction" do
          allow(success_result).to receive(:transaction).and_return(fake_transaction)
          allow(gateway).to receive_message_chain(:transaction, sale: success_result) # Setup method calls to gateway
          allow(BraintreeService::Transaction).to receive(:normalize).with(gateway, fake_transaction).and_return(fake_transaction)

          expect(gateway.transaction).to receive(:sale).and_return(success_result)
          result_transaction = BraintreeService::Transaction.submit_invoice_for_settlement(gateway, invoice)

          expect(result_transaction).to eq(fake_transaction)

          invoice.reload
          expect(invoice.transaction_id).to eq(fake_transaction.id)
        end

        it "reports payment and sends a receipt" do
          allow(success_result).to receive(:transaction).and_return(fake_transaction)
          allow(gateway).to receive_message_chain(:transaction, sale: success_result) # Setup method calls to gateway
          allow(BraintreeService::Transaction).to receive(:normalize).with(gateway, fake_transaction).and_return(fake_transaction)

          expect(gateway.transaction).to receive(:sale).and_return(success_result)
          allow(BillingMailer).to receive_message_chain(:receipt, :deliver_later)
          expect(BillingMailer).to receive(:receipt).with(invoice.member.email, fake_transaction.id, invoice.id)
          expect(BraintreeService::Transaction).to receive(:send_slack_message).with(/received for #{invoice.name}/i)
          BraintreeService::Transaction.submit_invoice_for_settlement(gateway, invoice)
        end

        it "raises error if failed result" do
          allow(gateway).to receive_message_chain(:transaction, sale: error_result) # Setup method calls to gateway
          allow(Error::Braintree::Result).to receive(:new).with(error_result).and_return(Error::Braintree::Result.new) # Bypass error instantiation
          allow(BraintreeService::Subscription).to receive(:create).with(gateway, invoice).and_return(error_result)

          expect(gateway.transaction).to receive(:sale).and_return(error_result)
          expect{ BraintreeService::Transaction.submit_invoice_for_settlement(gateway, invoice) }.to raise_error(Error::Braintree::Result)
        end
      end
    end
  end
end