require 'swagger_helper'

describe 'Invoices API', type: :request do
  path '/invoices' do
    get 'Gets a list of invoices' do
      tags 'Invoices'
      operationId "listInvoices"
      parameter name: :pageNum, in: :query, type: :number, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false

      parameter name: :settled, in: :query, type: :boolean, required: false
      parameter name: :pastDue, in: :query, type: :boolean, required: false
      parameter name: :refunded, in: :query, type: :boolean, required: false
      parameter name: :refundRequested, in: :query, type: :boolean, required: false

      parameter name: :planId, in: :query, schema: { type: :array, items: { type: :string } }, required: false
      parameter name: :resourceId, in: :query, schema: { type: :array, items: { type: :string } }, required: false
      parameter name: :resourceClass, in: :query, schema: { type: :array, items: { type: :string } }, required: false

      response '200', 'invoices found' do
        let(:member) { create(:member) }
        let(:invoices) { create_list(:invoice, member: member) }
        before { sign_in member }

        schema type: :array,
            items: { '$ref' => '#/components/schemas/Invoice' }

        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/components/schemas/error'
        run_test!
      end
    end

    post 'Create an invoice' do
      tags 'Invoices'
      operationId 'createInvoice'
      parameter name: :createInvoiceDetails, in: :body, schema: {
        title: :createInvoiceDetails,
        type: :object,
        properties: {
          id: { type: :string },
          discountId: { type: :string }
        },
        required: [:id]
      }, required: true

      response '200', 'invoice created' do
        before { sign_in create(:member) }

        schema '$ref' => '#/components/schemas/Invoice'

        let(:createInvoiceDetails) {{ id: create(:invoice_option).id }}

        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:createInvoiceDetails) {{ id: create(:invoice_option).id }}
        run_test!
      end

      response '422', 'parameter missing' do
        before { sign_in create(:member) }
        schema '$ref' => '#/components/schemas/error'
        let(:createInvoiceDetails)  {{ discountId: 'some_discount' }}
        run_test!
      end

      response '404', 'invoice option not found' do
        before { sign_in create(:member) }
        schema '$ref' => '#/components/schemas/error'
        let(:createInvoiceDetails) {{ id: 'invalid' }}
        run_test!
      end
    end
  end
end
