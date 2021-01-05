require 'swagger_helper'

describe 'Billing::Receipts API', type: :request do
  let(:customer) { create(:member, customer_id: "foo") }
  let(:non_customer) { create(:member) }
  let(:gateway) { double }
  let(:invoice) { create(:invoice, member: customer, id: "foobar", transaction_id: "t1")}
  let(:transaction) { build(:transaction, invoice: invoice, id: "t1") }

  before do
    create(:permission, member: customer, name: :billing, enabled: true )
    create(:permission, member: non_customer, name: :billing, enabled: true )
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
  end

  path '/billing/receipts/{id}' do 
    get 'Get a receipt for an invoice' do 
      tags 'Receipts'
      operationId 'getReceipt'
      parameter name: :id, in: :path, type: :string
      
      response '200', 'Receipt found' do 
        before do
          sign_in customer
          allow(BraintreeService::Transaction).to receive(:get_transaction).with(gateway, "t1").and_return(transaction)
        end

        let(:id) { invoice.id }
        run_test!
      end

      # This is an HTML request so they'll just be redirected to the login page if not auth'd
      response '302', 'User not authenticated' do
        let(:id) { invoice.id }
        run_test!
      end

      response '403', 'User not authorized' do
        before { sign_in non_customer }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:invoice).id }
        run_test!
      end

      response '404', 'Invoice not found' do
        before { sign_in customer }
        schema '$ref' => '#/components/schemas/error'

        let(:id) { "invalid" }
        run_test!
      end

      response '404', 'Transaction not found' do
        before { sign_in customer }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:invoice).id }
        run_test!
      end
    end
  end
end