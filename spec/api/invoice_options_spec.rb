require 'swagger_helper'

describe 'InvoiceOptions API', type: :request do
  path '/invoice_options' do 
    get 'Gets a list of invoice_options' do 
      tags 'InvoiceOptions'
      operationId "listInvoiceOptions"
      parameter name: :pageNum, in: :query, type: :number, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false
      parameter name: :onlyEnabled, in: :query, type: :boolean, required: false
      parameter name: :subscriptionOnly, in: :query, type: :boolean, required: false
      parameter name: :types, in: :query, schema: { type: :array, items: { type: :string } }, required: false

      response '200', 'invoice_options found' do 
        schema type: :array,
            items: { '$ref' => '#/components/schemas/InvoiceOption' }

        let(:invoice_options) { create_list(:invoice_option) }
        run_test!
      end
    end
  end

  path '/invoice_options/{id}' do 
    get 'Gets an Invoice Option' do 
      tags 'InvoiceOptions'
      operationId "getInvoiceOption"
      parameter name: :id, in: :path, type: :string

      response '200', 'invoice option found' do
        let(:id) { create(:invoice_option).id }

        schema '$ref' => '#/components/schemas/InvoiceOption'

        run_test!
      end

      response '404', 'invoice option not found' do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end