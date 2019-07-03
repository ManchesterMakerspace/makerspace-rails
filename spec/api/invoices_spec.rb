require 'swagger_helper'

describe 'Invoices API', type: :request do
  path '/invoices' do 
    get 'Gets a list of invoices' do 
      tags 'Invoices'
      parameter name: :pageNum, in: :query, type: :integer, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false

      response '200', 'invoices found' do 
        let(:member) { create(:member) }
        let(:invoices) { create_list(:invoice, member: member) }
        before { sign_in member }

        schema type: :object,
        properties: {
          invoices: { 
            type: :array,
            items: { '$ref' => '#/definitions/Invoice' }
          }
        },
        required: [ 'invoices' ]

        run_test!
      end

      response '401', 'User not authenticated' do 
        schema '$ref' => '#/definitions/error'
        run_test!
      end
    end
    
    post 'Create an invoice' do 
      tags 'Invoices'
      parameter name: :resource_payload, in: :body, schema: {
        type: :object,
        properties: {
          invoiceOption: {
            type: :object,
            properties: {
              id: { type: :string },
              discountId: { type: :string }
            },
            required: [:id]
          }
        },
        required: [:invoiceOption]
      }

      response '200', 'invoice created' do 
        before { sign_in create(:member) }

        schema type: :object,
        properties: {
          invoice: { 
            '$ref' => '#/definitions/Invoice'
          }
        },
        required: [ 'invoice' ]

        let(:resource_payload) {{ invoiceOption: { id: create(:invoice_option).id } }}

        run_test!
      end

      response '401', 'User not authenticated' do 
        schema '$ref' => '#/definitions/error'
        let(:resource_payload) {{ invoiceOption: { id: create(:invoice_option).id } }}
        run_test!
      end

      response '422', 'parameter missing' do 
        before { sign_in create(:member) }
        schema '$ref' => '#/definitions/error'
        let(:resource_payload)  {{ invoiceOption: { discountId: 'some_discount' } }}
        run_test!
      end
  
      response '404', 'invoice option not found' do
        before { sign_in create(:member) }
        schema '$ref' => '#/definitions/error'
        let(:resource_payload) {{ invoiceOption: { id: 'invalid' } }}
        run_test!
      end
    end
  end

  # Path doesn't exist
  # path '/invoices/{id}' do
  #   get 'Gets a invoice' do 
  #     tags 'Invoices'
  #     parameter name: :id, in: :path, type: :string

  #     response '200', 'invoice found' do
  #       before { sign_in create(:member) }
  #       schema type: :object,
  #         properties: {
  #           invoice: {
  #             '$ref' => '#/definitions/Invoice'
  #           }
  #         },
  #         required: [ 'invoice' ]

  #       let(:id) { create(:invoice).id }
  #       run_test!
  #     end

  #     response '401', 'User not authorized' do 
  #       before { sign_in create(:member) }
  #       let(:invoice) { create(:invoice, member: create(:member)) }
  #       schema '$ref' => '#/definitions/error'
  #       let(:id) { invoice.id }
  #       run_test!
  #     end

  #     response '401', 'User not authenticated' do 
  #       schema '$ref' => '#/definitions/error'
  #       let(:id) { create(:invoice).id }
  #       run_test!
  #     end

  #     response '404', 'invoice not found' do
  #       schema '$ref' => '#/definitions/error'
  #       let(:id) { 'invalid' }
  #       run_test!
  #     end
  #   end
  # end
end
