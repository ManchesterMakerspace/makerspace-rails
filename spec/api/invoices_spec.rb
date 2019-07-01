require 'swagger_helper'

describe 'Invoices API' do
  path '/invoices' do 
    get 'Gets a list of invoices' do 
      tags 'Invoices'
      parameter name: :pageNum, in: :query, type: :integer
      parameter name: :orderBy, in: :query, type: :string
      parameter name: :order, in: :query, type: :string

      response '200', 'invoices found' do 
        schema type: :object,
        properties: {
          invoices: { 
            type: :array,
            items: { '$ref' => '#/definitions/Invoice' }
          }
        },
        required: [ 'invoices' ]

        let(:invoices) { create_list(:invoice) }
        run_test!
      end
    end
    
    post 'Create an invoice' do 
      tags 'Invoices'
      parameter name: :invoiceOption, in: :body, schema: {
        type: :object,
        properties: {
          id: { type: :string },
          discountId: { type: :string }
        },
        required: [:id]
      }

      response '200', 'invoice created' do 
        schema type: :object,
        properties: {
          invoice: { 
            '$ref' => '#/definitions/Invoice'
          }
        },
        required: [ 'invoice' ]

        let(:invoiceOption) { { id: create(:invoice_option).id } }

        run_test!
      end

      response '402', 'parameter missing' do 
        schema '$ref' => '#/definitions/error'
        let(:invoiceOption) { { discountId: 'some_discount' } }
        run_test!
      end
  
      response '404', 'invoice option not found' do
        schema '$ref' => '#/definitions/error'
        let(:invoiceOption) { { id: 'invalid' } }
        run_test!
      end
    end
  end

  path '/invoices/{id}' do
    get 'Gets a invoice' do 
      tags 'Invoices'
      parameter name: :id, in: :path, type: :string

      response '200', 'invoice found' do
        schema type: :object,
          properties: {
            invoice: {
              '$ref' => '#/definitions/Invoice'
            }
          },
          required: [ 'invoice' ]

        let(:id) { create(:invoice).id }
        run_test!
      end

      response '404', 'invoice not found' do
        schema '$ref' => '#/definitions/error'
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
