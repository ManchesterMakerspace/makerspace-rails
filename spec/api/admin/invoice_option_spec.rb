require 'swagger_helper'

describe 'Admin::InvoiceOptions API', type: :request do
  let(:admin) { create(:member, :admin) }
  let(:basic) { create(:member) }

  path '/admin/invoice_options' do
    post 'Creates an invoice option' do
      tags 'InvoiceOptions'
      operationId "adminCreateInvoiceOption"

      parameter name: :createInvoiceOptionDetails, in: :body, schema: {
        title: :createInvoiceOptionDetails,
        '$ref' => '#/components/schemas/NewInvoiceOption'  
      }, required: true

      request_body_json schema: {
        title: :createInvoiceOptionDetails,
        '$ref' => '#/components/schemas/NewInvoiceOption'  
      }, required: true

      response '200', 'invoice option created' do
        before { sign_in admin }

        schema '$ref' => '#/components/schemas/InvoiceOption'

        let(:createInvoiceOptionDetails) {{
          name: "something",
          description: "some description",
          resourceClass: "member",
          amount: "65",
          planId: "8765",
          quantity: "2"
        }}

        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:createInvoiceOptionDetails) {{
          name: "something",
          description: "some description",
          resourceClass: "member",
          amount: "65",
          planId: "8765",
          quantity: "2"
        }}
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:createInvoiceOptionDetails) {{
          name: "something",
          description: "some description",
          resourceClass: "member",
          amount: "65",
          planId: "8765",
          quantity: "2"
        }}
        run_test!
      end
    end
  end

  path "/admin/invoice_options/{id}" do
    put 'Updates an invoice option' do
      tags 'InvoiceOptions'
      operationId "adminUpdateInvoiceOption"
      parameter name: :id, in: :path, type: :string

      parameter name: :updateInvoiceOptionDetails, in: :body, schema: {
        title: :updateInvoiceOptionDetails, 
        '$ref' => '#/components/schemas/InvoiceOption' 
      }, required: true

      request_body_json schema: {
        title: :updateInvoiceOptionDetails, 
        '$ref' => '#/components/schemas/InvoiceOption' 
      }, required: true

      response '200', 'invoice option updated' do
        before { sign_in admin }

        schema '$ref' => '#/components/schemas/InvoiceOption'

        let(:updateInvoiceOptionDetails) {{
          name: "something",
          description: "some description",
          resourceClass: "member",
          amount: "65",
          planId: "8765",
          quantity: "2"
        }}
        let(:id) { create(:invoice_option).id }
        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:updateInvoiceOptionDetails) {{
          name: "something",
          description: "some description",
          resourceClass: "member",
          amount: "65",
          planId: "8765",
          quantity: "2"
        }}
        let(:id) { create(:invoice_option).id }
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:updateInvoiceOptionDetails) {{
          name: "something",
          description: "some description",
          resourceClass: "member",
          amount: "65",
          planId: "8765",
          quantity: "2"
        }}
        let(:id) { create(:invoice_option).id }
        run_test!
      end

      response '404', 'Invoice option not found' do
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:updateInvoiceOptionDetails) {{
          name: "something",
          description: "some description",
          resourceClass: "member",
          amount: "65",
          planId: "8765",
          quantity: "2"
        }}
        let(:id) { 'invalid' }
        run_test!
      end
    end

    delete 'Deletes an invoice option' do
      tags 'InvoiceOptions'
      operationId "adminDeleteInvoiceOption"
      parameter name: :id, in: :path, type: :string

      response '204', 'invoice option deleted' do
        before { sign_in admin }
        let(:id) { create(:invoice_option).id }
        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:invoice_option).id }
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:invoice_option).id }
        run_test!
      end

      response '404', 'Invoice Option not found' do
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end