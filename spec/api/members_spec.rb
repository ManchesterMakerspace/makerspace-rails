require 'swagger_helper'

describe 'Members API' do 
  path '/members' do 
    get 'Gets a list of members' do 
      tags 'Members'
      parameter name: :pageNum, in: :query, type: :integer
      parameter name: :orderBy, in: :query, type: :string
      parameter name: :order, in: :query, type: :string
      parameter name: :currentMembers, in: :query, type: :boolean

      response '200', 'members found' do 
        schema type: :object,
        properties: {
          members: { 
            type: :array,
            items: { '$ref' => '#/definitions/Member' }
          }
        },
        required: [ 'members' ]

        let(:members) { create_list(:member) }
        run_test!
      end
    end
  end

  path '/members/{id}' do
    get 'Gets a member' do 
      tags 'Members'
      parameter name: :id, in: :path, type: :string

      response '200', 'member found' do
        schema type: :object,
          properties: {
            member: {
              '$ref' => '#/definitions/Member'
            }
          },
          required: [ 'member' ]

        let(:id) { create(:member).id }
        run_test!
      end

      response '404', 'rental not found' do
        schema '$ref' => '#/definitions/error'
        let(:id) { 'invalid' }
        run_test!
      end
    end

    put 'Updates a member and uploads signature' do
      tags 'Members'
      produces 'application/json'
      consumes 'application/json'
      parameter name: :id, in: :path, type: :string
      parameter name: :member, in: :body, schema: {
        type: :object,
        properties: {
          firstname: { type: :string },
          lastname: { type: :string },
          email: { type: :string },
          signature: { type: :string }
        }
      }

      response '200', 'member updated' do
        schema type: :object,
          properties: {
            member: {
              '$ref' => '#/definitions/Member'
            }
          },
          required: [ 'member' ]

        let(:id) { create(:member).id }
        run_test!
      end

      response '401', 'unauthorized' do 
        schema '$ref' => '#/definitions/error'

        let(:logged_in_user) { create(:member) }
        let(:other_user) { create(:member) }
        let(:id) { other_user.id }
        run_test!
      end

      response '404', 'member not found' do
        schema '$ref' => '#/definitions/error'

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end