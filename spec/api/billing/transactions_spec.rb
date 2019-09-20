require 'swagger_helper'

describe 'Billing::Transactions API', type: :request do
  let(:customer) { create(:member, customer_id: "foo") }
  let(:non_customer) { create(:member) }
  let(:gateway) { double }
  let(:invoice_option) { create(:invoice_option, resource_class: "rental") }

  before do
    create(:permission, member: customer, name: :billing, enabled: true )
    create(:permission, member: non_customer, name: :billing, enabled: true )
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
  end

  path '/billing/transactions' do
    get 'Gets a list of transactions' do
      tags 'Transactions'
      operationId "listTransactions"
      parameter name: :startDate, in: :query, type: :string, required: false
      parameter name: :endDate, in: :query, type: :string, required: false
      parameter name: :refund, in: :query, type: :boolean, required: false
      parameter name: :type, in: :query, type: :string, required: false

      parameter name: :transactionStatus, in: :query, type: :array, items: { type: :string }, required: false
      parameter name: :paymentMethodToken, in: :query, type: :array, items: { type: :string }, required: false

      response '200', 'transactions found' do
        let(:invoice) { create(:invoice, member: customer)}
        let(:transactions) { build_list(:transaction, 3, invoice: invoice) }
        before do
          sign_in customer
          allow(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, anything).and_return(transactions)
        end

        schema type: :object,
        properties: {
          transactions: {
            type: :array,
            items: { '$ref' => '#/definitions/Transaction' }
          }
        },
        required: [ 'transactions' ]

        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/definitions/error'
        run_test!
      end

      response '403', 'User not authorized' do
        before { sign_in non_customer }
        schema '$ref' => '#/definitions/error'
        run_test!
      end
    end

    post 'Create an transaction' do
      let(:invoice) { create(:invoice, member: customer) }
      let(:transaction) { build(:transaction, invoice: invoice) }
      before do
        allow(Invoice).to receive(:find).and_return(invoice)
        allow(invoice).to receive(:submit_for_settlement).with(gateway, "1234").and_return(transaction)
        allow(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).and_return(true)
      end

      tags 'Transactions'
      operationId "createTransaction"
      parameter name: :createTransactionDetails, in: :body, schema: {
        type: :object,
        properties: {
          transaction: {
            type: :object,
            properties: {
              invoiceId: { type: :string, 'x-nullable': true },
              invoiceOptionId: { type: :string, 'x-nullable': true },
              discountId: { type: :string, 'x-nullable': true },
              paymentMethodId: { type: :string }
            }
          }
        },
        required: [:transaction]
      }, required: true

      response '200', 'transaction created' do
        before do
          sign_in customer
        end

        schema type: :object,
        properties: {
          transaction: {
            '$ref' => '#/definitions/Transaction'
          }
        },
        required: [ 'transaction' ]

        let(:createTransactionDetails) {{
          transaction: { invoiceId: invoice.id, paymentMethodId: "1234" }
        }}

        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/definitions/error'
        let(:createTransactionDetails) {{
          transaction: { invoiceId: "1234" , paymentMethodId: "1234" }
        }}
        run_test!
      end

      response '403', 'User not authorized' do
        before { sign_in non_customer }
        schema '$ref' => '#/definitions/error'
        let(:createTransactionDetails) {{
          transaction: { invoiceId: "1234" , paymentMethodId: "1234" }
        }}
        run_test!
      end

      response '422', 'parameter missing' do
        before { sign_in customer }
        schema '$ref' => '#/definitions/error'
        let(:createTransactionDetails)  {{
          transaction: { invoiceId: 'some invoice' }
        }}
        run_test!
      end

      response '422', 'Wrong invoice option type' do
        before { sign_in customer }
        schema '$ref' => '#/definitions/error'
        let(:createTransactionDetails)  {{
          transaction: { invoiceOptionId: invoice_option.id }
        }}
        run_test!
      end

      response '404', 'invoice not found' do
        before {
          sign_in customer
          allow(Invoice).to receive(:find).and_return(nil)
        }
        schema '$ref' => '#/definitions/error'
        let(:createTransactionDetails) {{ transaction: { invoiceId: 'invalid', paymentMethodId: "1234" } }}
        run_test!
      end

      response '404', 'invoice option not found' do
        before {
          sign_in customer
          allow(Invoice).to receive(:find).and_return(nil)
        }
        schema '$ref' => '#/definitions/error'
        let(:createTransactionDetails) {{ transaction: { invoiceOptionId: 'invalid', paymentMethodId: "1234" } }}
        run_test!
      end
    end
  end

  path '/billing/transactions/{id}' do
    delete 'Request refund for a transaction' do
      let(:transaction) { build(:transaction, id: "foo") }
      before do
        allow(BraintreeService::Transaction).to receive(:get_transaction).with(gateway, transaction.id).and_return(transaction)
        create(:invoice, transaction_id: transaction.id, member: customer)
      end

      tags 'Transactions'
      operationId "deleteTransaction"
      parameter name: :id, in: :path, type: :string

      response '204', 'refund requested' do
        before { sign_in customer }

        let(:id) { transaction.id }
        run_test!
      end

      response '403', 'User not authorized' do
        before { sign_in non_customer }
        schema '$ref' => '#/definitions/error'
        let(:id) { build(:transaction).id }
        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/definitions/error'
        let(:id) { build(:transaction).id }
        run_test!
      end

      response '404', 'invoice not found' do
        let(:other_transaction) { build(:transaction, id: "bar") }
        before do
          sign_in customer
          allow(BraintreeService::Transaction).to receive(:get_transaction).with(gateway, other_transaction.id).and_return(other_transaction)
        end

        schema '$ref' => '#/definitions/error'
        let(:id) { other_transaction.id }
        run_test!
      end
    end
  end
end
