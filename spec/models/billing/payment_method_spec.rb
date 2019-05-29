require 'rails_helper'

RSpec.describe BraintreeService::PaymentMethod, type: :model do
  let(:gateway) { double } # Create a fake gateway
  let(:fake_customer) { double(id: "bar") }
  let(:fake_payment_method) { double(id: "foobar", customer_id: fake_customer.id) }

  it "has a factory" do
    expect(build(:credit_card)).to be_truthy
    expect(build(:paypal_account)).to be_truthy
  end

  context "public methods" do
    describe "#get_payment_methods_for_customer" do
      it "finds payment methods by customer id" do 
        allow(gateway).to receive_message_chain(:customer, find: fake_customer).and_return(fake_customer)
        allow(fake_customer).to receive_message_chain(:payment_methods, map: [fake_payment_method])

        expect(gateway.customer).to receive(:find).with(fake_customer.id).and_return(fake_customer)
        result = BraintreeService::PaymentMethod.get_payment_methods_for_customer(gateway, fake_customer.id)
        expect(result).to eq([fake_payment_method])
      end
    end

    describe "#find_payment_method_for_customer" do 
      it "finds single payment method for customer" do 
        allow(gateway).to receive_message_chain(:payment_method, find: fake_payment_method.id).and_return(fake_payment_method)
        allow(BraintreeService::PaymentMethod).to receive(:normalize_payment_method).with(gateway, fake_payment_method).and_return(fake_payment_method)
        expect(gateway.payment_method).to receive(:find).with(fake_payment_method.id).and_return(fake_payment_method)
        result = BraintreeService::PaymentMethod.find_payment_method_for_customer(gateway, fake_payment_method.id, fake_customer.id)
        expect(result).to eq(fake_payment_method)
      end

      it "raises error if customer ID doesn't match" do 
        allow(gateway).to receive_message_chain(:payment_method, find: fake_payment_method.id).and_return(fake_payment_method)
        allow(BraintreeService::PaymentMethod).to receive(:normalize_payment_method).with(gateway, fake_payment_method).and_return(fake_payment_method)
        expect { BraintreeService::PaymentMethod.find_payment_method_for_customer(gateway, fake_payment_method.id, "wrong id") }.to raise_error(Error::Braintree::CustomerMismatch)
      end
    end

    describe "#delete_payment_method" do 
      it "deletes payment method by id" do 
        allow(gateway).to receive_message_chain(:payment_method, delete: fake_payment_method)
        expect(gateway.payment_method).to receive(:delete).with(fake_payment_method.id, { revoke_all_grants: true }).and_return(fake_payment_method)
        result = BraintreeService::PaymentMethod.delete_payment_method(gateway, fake_payment_method.id)
        expect(result).to eq(fake_payment_method)
      end
    end
  end
end
