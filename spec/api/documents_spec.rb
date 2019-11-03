require 'swagger_helper'

describe 'Documents API', type: :request do
  let(:customer) { create(:member, customer_id: "foo") }
  let(:non_customer) { create(:member) }

  path '/documents/{id}' do 
    get 'Get a document' do 
      tags 'Documents'
      operationId 'getDocument'
      parameter name: :id, in: :path, type: :string
      parameter name: :resourceId, in: :query, type: :string, required: false
      
      response '200', 'Document found' do 
        before do
          sign_in customer
        end
        let(:id) { "code_of_conduct" }
        run_test!
      end

      # This is an HTML request so they'll just be redirected to the login page if not auth'd
      response '302', 'User not authenticated' do
        let(:id) { "code_of_conduct" }
        run_test!
      end

      response '404', 'Document not found' do
        before { sign_in customer }
        schema '$ref' => '#/definitions/error'

        let(:id) { "invalid" }
        run_test!
      end
    end
  end
end