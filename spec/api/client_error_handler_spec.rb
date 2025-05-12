require 'swagger_helper'

describe 'ClientErrorHandler API', type: :request do
  path '/client_error_handler' do 
    post 'Sends a slack message' do 
      tags 'ClientErrorHandler'
      operationId 'message'

      parameter name: :messageDetails, in: :body, schema: {
        title: :messageDetails,
        type: :object,
        properties: {
          message: {
            type: :string
          }
        },
        required: [:message]
      }

      response '204', 'Message sent' do 
        let(:messageDetails) {{
          message: "Test message"
        }}
        run_test!
      end
    end
  end
end