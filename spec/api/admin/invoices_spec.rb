require 'swagger_helper'

describe 'Admin::Invoices API', type: :request do
  let(:admin) { create(:member, :admin) }
  let(:basic) { create(:member) }
  let(:invoice_option) { create(:invoice_option) }
  let(:invoices) { create_list(:invoice, 3) }
  path '/admin/invoices' do
    get 'Gets a list of invoices' do
      tags 'Invoices'
      operationId "adminListInvoices"
      parameter name: :pageNum, in: :query, type: :number, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false
      parameter name: :search, in: :query, type: :string, required: false

      parameter name: :settled, in: :query, type: :boolean, required: false
      parameter name: :pastDue, in: :query, type: :boolean, required: false
      parameter name: :refunded, in: :query, type: :boolean, required: false
      parameter name: :refundRequested, in: :query, type: :boolean, required: false

      parameter name: :planId, in: :query, schema: { type: :array, items: { type: :string } }, required: false
      parameter name: :resourceId, in: :query, schema: { type: :array, items: { type: :string } }, required: false
      parameter name: :memberId, in: :query, schema: { type: :array, items: { type: :string } }, required: false
      parameter name: :resourceClass, in: :query, schema: { type: :array, items: { type: :string } }, required: false

      response '200', 'invoices found' do
        before { sign_in admin }
        schema type: :object,
        properties: {
          invoices: {
            type: :array,
            items: { '$ref' => '#/components/schemas/Invoice' }
          }
        },
        required: [ 'invoices' ]

        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        run_test!
      end
    end

    post 'Creates an invoice' do
      tags 'Invoices'
      operationId "adminCreateInvoices"
      parameter name: :createInvoiceDetails, in: :body, schema: {
        title: :createInvoiceDetails, 
        type: :object,
        properties: {
          invoiceOption: {
            type: :object,
            properties: {
              id: { type: :string },
              discountId: { type: :string, 'x-nullable': true },
              memberId: { type: :string },
              resourceId: { type: :string },
            }
          }
        }
      }, required: true
      
      request_body_json schema: {
        title: :createInvoiceDetails, 
        type: :object,
        properties: {
          invoiceOption: {
            type: :object,
            properties: {
              id: { type: :string },
              discountId: { type: :string, 'x-nullable': true },
              memberId: { type: :string },
              resourceId: { type: :string },
            }
          }
        }
      }, required: true

      response '200', 'invoice created' do
        before { sign_in admin }

        schema type: :object,
        properties: {
          invoice: { '$ref' => '#/components/schemas/Invoice' },
        },
        required: [ 'invoice' ]

        let(:createInvoiceDetails) {{
          invoiceOption: {
            id: invoice_option.id,
            memberId: basic.id,
            resourceId: basic.id,
          }
        }}

        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:createInvoiceDetails) {{
          invoiceOption: {
            id: invoice_option.id,
            memberId: basic.id,
            resourceId: basic.id,
          }
        }}
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:createInvoiceDetails) {{
          invoiceOption: {
            id: invoice_option.id,
            memberId: basic.id,
            resourceId: basic.id,
          }
        }}
        run_test!
      end

      response '422', 'missing parameter' do
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:createInvoiceDetails) {{
          invoiceOption: {
            memberId: basic.id,
            resourceId: basic.id,
          }
        }}
        run_test!
      end

      response '404', 'member not found' do
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:createInvoiceDetails) {{
          invoiceOption: {
            id: invoice_option.id,
            memberId: "invalid",
            resourceId: basic.id,
          }
        }}
        run_test!
      end

      response '404', 'invoice option not found' do
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:createInvoiceDetails) {{
          invoiceOption: {
            id: "invalid",
            memberId: basic.id,
            resourceId: basic.id,
          }
        }}
        run_test!
      end
    end
  end

  path "/admin/invoices/{id}" do
    put 'Updates an invoice' do
      tags 'Invoices'
      operationId "adminUpdateInvoice"
      parameter name: :id, in: :path, type: :string

      parameter name: :updateInvoiceDetails, in: :body, schema: {
        title: :updateInvoiceDetails,
        type: :object,
        properties: {
          invoice: { '$ref' => '#/components/schemas/Invoice'   }
        }
      }, required: true

      request_body_json schema: {
        title: :updateInvoiceDetails,
        type: :object,
        properties: {
          invoice: { '$ref' => '#/components/schemas/Invoice'   }
        }
      }, required: true

      response '200', 'invoice updated' do
        before { sign_in admin }

        schema type: :object,
        properties: {
          invoice: { '$ref' => '#/components/schemas/Invoice' },
        },
        required: [ 'invoice' ]

        let(:updateInvoiceDetails) {{
          invoice: {
            description: "some description",
            resourceClass: "member",
            resourceId: basic.id,
            memberId: basic.id,
            amount: "65",
            quantity: "2"
          }
        }}
        let(:id) { create(:invoice).id }
        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:updateInvoiceDetails) {{
          invoice: {
            description: "some description",
            resourceClass: "member",
            resourceId: basic.id,
            memberId: basic.id,
            amount: "65",
            quantity: "2"
          }
        }}
        let(:id) { create(:invoice).id }
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:updateInvoiceDetails) {{
          invoice: {
            description: "some description",
            resourceClass: "member",
            resourceId: basic.id,
            memberId: basic.id,
            amount: "65",
            quantity: "2"
          }
        }}
        let(:id) { create(:invoice).id }
        run_test!
      end

      response '404', 'Invoice not found' do
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:updateInvoiceDetails) {{
          invoice: {
            description: "some description",
            resourceClass: "member",
            resourceId: basic.id,
            memberId: basic.id,
            amount: "65",
            quantity: "2"
          }
        }}
        let(:id) { 'invalid' }
        run_test!
      end
    end

    delete 'Deletes an invoice' do
      tags 'Invoices'
      operationId "adminDeleteInvoice"
      parameter name: :id, in: :path, type: :string

      response '204', 'invoice deleted' do
        before { sign_in admin }
        let(:id) { create(:invoice).id }
        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:invoice).id }
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:invoice).id }
        run_test!
      end

      response '404', 'Invoice not found' do
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end