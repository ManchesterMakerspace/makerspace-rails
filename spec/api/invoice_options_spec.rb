require 'swagger_helper'

describe 'InvoiceOptions API', type: :request do
  path '/invoice_options' do 
    get 'Gets a list of invoice_options' do 
      tags 'InvoiceOptions'
      operationId "listInvoiceOptions"
      parameter name: :pageNum, in: :query, type: :integer, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false
      parameter name: :subscriptionOnly, in: :query, type: :boolean, required: false
      parameter name: :types, in: :query, schema: {
        type: :array,
        items: { type: :string }
      }, required: false

      response '200', 'invoice_options found' do 
        schema type: :object,
        properties: {
          invoiceOptions: { 
            type: :array,
            items: { '$ref' => '#/definitions/InvoiceOption' }
          }
        },
        required: [ 'invoiceOptions' ]

        let(:invoice_options) { create_list(:invoice_option) }
        run_test!
      end
    end
  end
end