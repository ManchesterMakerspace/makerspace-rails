require 'swagger_helper'

describe 'Billing::Transactions API', type: :request do
  let(:admin) { create(:member, :admin) }
  let(:basic) { create(:member) }
  let(:gateway) { double }
  before do 
    create(:permission, member: admin, name: :billing, enabled: true )
    create(:permission, member: basic, name: :billing, enabled: true )
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
  end

  path '/admin/billing/transactions' do 
    get 'Gets a list of transactions' do 
      tags 'Transactions'
      operationId "adminListTransaction"
      parameter name: :startDate, in: :query, type: :string, required: false
      parameter name: :endDate, in: :query, type: :string, required: false
      parameter name: :search, in: :query, type: :string, required: false
      parameter name: :refund, in: :query, type: :boolean, required: false
      parameter name: :type, in: :query, type: :string, required: false
      parameter name: :transactionStatus, in: :query, type: :array, items: { type: :string }, required: false
      parameter name: :customerId, in: :query, type: :string, required: false

      response '200', 'transactions found' do 
        let(:invoice) { create(:invoice, member: basic)}
        let(:transactions) { build_list(:transaction, 3, invoice: invoice) }
        before do 
          sign_in admin
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
        before { sign_in basic }
        schema '$ref' => '#/definitions/error'
        run_test!
      end
    end
  end

  path '/admin/billing/transactions/{id}' do
    get 'Gets a transaction' do 
      let(:invoice) { create(:invoice, member: basic)}
      let(:transaction) { build(:transaction, invoice: invoice, id: "foo") }

      tags 'Transactions'
      operationId "adminGetTransaction"
      parameter name: :id, in: :path, type: :string
      response '200', 'transaction found' do 
        before do 
          sign_in admin
          allow(BraintreeService::Transaction).to receive(:get_transaction).with(gateway, transaction.id).and_return(transaction)
        end

        schema type: :object,
        properties: {
          transaction: {'$ref' => '#/definitions/Transaction'}
        },
        required: [ 'transaction' ]
        let(:id) { transaction.id }

        run_test!
      end

      response '401', 'User not authenticated' do 
        schema '$ref' => '#/definitions/error'
        let(:id) { transaction.id }
        run_test!
      end

      response '403', 'User not authorized' do 
        before { sign_in basic }
        schema '$ref' => '#/definitions/error'
        let(:id) { transaction.id }
        run_test!
      end
    end

    delete 'Request refund for a transaction' do 
      let(:transaction) { build(:transaction, id: "foo") }
      before do 
        allow(BraintreeService::Transaction).to receive(:refund).with(gateway, transaction.id)
      end

      tags 'Transactions'
      operationId 'adminDeleteTransaction'
      parameter name: :id, in: :path, type: :string

      response '204', 'refund requested' do
        before { sign_in admin }

        let(:id) { transaction.id }
        run_test!
      end

      response '403', 'User not authorized' do 
        before { sign_in basic }
        schema '$ref' => '#/definitions/error'
        let(:id) { build(:transaction).id }
        run_test!
      end

      response '401', 'User not authenticated' do 
        schema '$ref' => '#/definitions/error'
        let(:id) { build(:transaction).id }
        run_test!
      end
    end
  end
end
