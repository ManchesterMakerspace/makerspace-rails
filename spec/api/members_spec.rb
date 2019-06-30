require 'swagger_helper'

describe 'Members API' do 
  path '/api/members' do 
    get 'Gets a list of members' do 
      tags 'Members'
      consumes 'application/json'
      parameter name: :currentMembers, in: :body, schema: {
        type: :boolean,
      }

      response '200', 'members found' do 
        schema type: :object,
        properties: {
          members: { 
            type: :array,
            items: { '$ref' => '#/definitions/member' }
          }
        },
        required: [ 'members' ]

        let(:members) { create_list(:member) }
        run_test!
      end
    end
  end
end