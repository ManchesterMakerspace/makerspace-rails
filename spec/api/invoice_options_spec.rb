require 'swagger_helper'

describe 'InvoiceOptionOptions API' do
  path '/invoice_options' do 
    get 'Gets a list of invoice_options' do 
      tags 'InvoiceOptions'
      parameter name: :pageNum, in: :query, type: :integer
      parameter name: :orderBy, in: :query, type: :string
      parameter name: :order, in: :query, type: :string
      parameter name: :subscriptionOnly, in: :query, type: :boolean
      parameter name: :types, in: :query, schema: {
        type: :array,
        items: { type: :string }
      }

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