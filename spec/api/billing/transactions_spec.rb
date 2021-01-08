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

      parameter name: :transactionStatus, in: :query, schema: { type: :array, items: { type: :string } }, required: false
      parameter name: :paymentMethodToken, in: :query, schema: { type: :array, items: { type: :string } }, required: false

      response '200', 'transactions found' do
        let(:t1) { build(:credit_card_transaction, member_id: customer) }
        let(:i1) { create(:invoice, member: customer, transaction_id: t1.id) }
        let(:t2) { build(:credit_card_transaction, member_id: customer) }
        let(:i2) { create(:invoice, member: customer, transaction_id: t2.id) }
        let(:t3) { build(:paypal_transaction, member_id: customer) }
        let(:i3) { create(:invoice, member: customer, transaction_id: t3.id) }

        before do
          [i1, i2, i3]
          transactions = [t1, t2, t3]
          sign_in customer
          allow(BraintreeService::Transaction).to receive(:get_transactions).with(gateway, anything).and_return(transactions)
        end

        schema type: :array,
            items: { '$ref' => '#/components/schemas/Transaction' }

        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/components/schemas/error'
        run_test!
      end

      response '403', 'User not authorized' do
        before { sign_in non_customer }
        schema '$ref' => '#/components/schemas/error'
        run_test!
      end
    end

    post 'Create an transaction' do
      let(:transaction) { build(:credit_card_transaction, id: "foo") }
      let(:invoice) { create(:invoice, member: customer, transaction_id: transaction.id)}

      before do
        allow(Invoice).to receive(:find).and_return(invoice)
        allow(invoice).to receive(:submit_for_settlement).with(gateway, "1234").and_return(transaction)
        allow(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).and_return(true)
      end

      tags 'Transactions'
      operationId "createTransaction"
      parameter name: :createTransactionDetails, in: :body, schema: {
        title: :createTransactionDetails, 
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
      
      request_body_json schema: {
        title: :createTransactionDetails, 
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

        schema '$ref' => '#/components/schemas/Transaction'

        let(:createTransactionDetails) {{
          transaction: { invoiceId: invoice.id, paymentMethodId: "1234" }
        }}

        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:createTransactionDetails) {{
          transaction: { invoiceId: "1234" , paymentMethodId: "1234" }
        }}
        run_test!
      end

      response '403', 'User not authorized' do
        before { sign_in non_customer }
        schema '$ref' => '#/components/schemas/error'
        let(:createTransactionDetails) {{
          transaction: { invoiceId: "1234" , paymentMethodId: "1234" }
        }}
        run_test!
      end

      response '422', 'parameter missing' do
        before { sign_in customer }
        schema '$ref' => '#/components/schemas/error'
        let(:createTransactionDetails)  {{
          transaction: { invoiceId: 'some invoice' }
        }}
        run_test!
      end

      response '422', 'Wrong invoice option type' do
        before { sign_in customer }
        schema '$ref' => '#/components/schemas/error'
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
        schema '$ref' => '#/components/schemas/error'
        let(:createTransactionDetails) {{ transaction: { invoiceId: 'invalid', paymentMethodId: "1234" } }}
        run_test!
      end

      response '404', 'invoice option not found' do
        before {
          sign_in customer
          allow(Invoice).to receive(:find).and_return(nil)
        }
        schema '$ref' => '#/components/schemas/error'
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
        schema '$ref' => '#/components/schemas/error'
        let(:id) { build(:transaction).id }
        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { build(:transaction).id }
        run_test!
      end

      response '404', 'invoice not found' do
        let(:other_transaction) { build(:transaction, id: "bar") }
        before do
          sign_in customer
          allow(BraintreeService::Transaction).to receive(:get_transaction).with(gateway, other_transaction.id).and_return(other_transaction)
        end

        schema '$ref' => '#/components/schemas/error'
        let(:id) { other_transaction.id }
        run_test!
      end
    end
  end
end
