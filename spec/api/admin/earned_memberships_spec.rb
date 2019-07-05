require 'swagger_helper'

describe 'Admin::EarnedMemberships API', type: :request do
  let(:admin) { create(:member, :admin) }
  let(:basic) { create(:member) }
  path '/admin/earned_memberships' do 
    get 'Gets a list of earned memberships' do 
      tags 'EarnedMemberships'
      operationId "adminListEarnedMembership"
      parameter name: :pageNum, in: :query, type: :integer, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false

      response '200', 'earned memberships found' do 
        before { sign_in admin }
        schema type: :object,
        properties: {
          earnedMemberships: { 
            type: :array,
            items: { '$ref' => '#/definitions/EarnedMembership' }
          }
        },
        required: [ 'earnedMemberships' ]

        run_test!
      end

      response '403', 'User unauthorized' do 
        before { sign_in basic }
        schema '$ref' => '#/definitions/error'
        run_test!
      end

      response '401', 'User unauthenticated' do 
        schema '$ref' => '#/definitions/error'
        run_test!
      end
    end

    post 'Creates an earned membership' do 
      tags 'EarnedMemberships'
      operationId "adminCreateEarnedMembership"
      parameter name: :new_resource, in: :body, schema: {
        type: :object,
        properties: {
          earnedMembership: { '$ref' => '#/definitions/EarnedMembership' },
        }
      }, required: true

      response '200', 'earned membership created' do 
        before { sign_in admin }

        schema type: :object,
        properties: {
          earnedMembership: { '$ref' => '#/definitions/EarnedMembership' },
        },
        required: [ 'earnedMembership' ]

        let(:new_resource) {{
          earnedMembership: {
            memberId: basic.id,
            requirements: create_list(:requirement, 2)
          }
        }}

        run_test!
      end

      response '403', 'User unauthorized' do 
        before { sign_in basic }
        schema '$ref' => '#/definitions/error'
        let(:new_resource) {{
          earnedMembership: {
            memberId: basic.id,
            requirements: create_list(:requirement, 2)
          }
        }}
        run_test!
      end

      response '401', 'User unauthenticated' do 
        schema '$ref' => '#/definitions/error'
        let(:new_resource) {{
          earnedMembership: {
            memberId: basic.id,
            requirements: create_list(:requirement, 2)
          }
        }}
        run_test!
      end
    end
  end

  path "/admin/earned_memberships/{id}" do 
    get 'Gets an earned membership' do 
      operationId "adminGetEarnedMembership"
      tags 'EarnedMemberships'
      parameter name: :id, in: :path, type: :string

      response '200', 'earned membership found' do
        before { sign_in admin }

        schema type: :object,
          properties: {
            earnedMembership: { '$ref' => '#/definitions/EarnedMembership' },
          },
          required: [ 'earnedMembership' ]

        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '403', 'User unauthorized' do 
        before { sign_in basic }
        schema '$ref' => '#/definitions/error'
        let(:new_resource) {{
          earnedMembership: {
            memberId: basic.id,
            requirements: create_list(:requirement, 2)
          }
        }}
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '401', 'User unauthenticated' do 
        schema '$ref' => '#/definitions/error'
        let(:new_resource) {{
          earnedMembership: {
            memberId: basic.id,
            requirements: create_list(:requirement, 2)
          }
        }}
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '404', 'EarnedMembership not found' do 
        before { sign_in admin }
        schema '$ref' => '#/definitions/error'
        let(:new_resource) {{
          earnedMembership: {
            memberId: basic.id,
            requirements: create_list(:requirement, 2)
          }
        }}
        let(:id) { 'invalid' }
        run_test!
      end
    end

    put 'Updates an earned membership' do 
      tags 'EarnedMemberships'
      operationId "adminUpdateEarnedMembership"
      parameter name: :id, in: :path, type: :string

      parameter name: :new_resource, in: :body, schema: {
        type: :object,
        properties: {
          earnedMembership: { '$ref' => '#/definitions/EarnedMembership' },
        }
      }, required: true

      response '200', 'earned membership updated' do 
        before { sign_in admin }

        schema type: :object,
        properties: {
          earnedMembership: { '$ref' => '#/definitions/EarnedMembership' },
        },
        required: [ 'earnedMembership' ]

        let(:new_resource) {{
          earnedMembership: {
            memberId: basic.id,
            requirements: create_list(:requirement, 2)
          }
        }}
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '403', 'User unauthorized' do 
        before { sign_in basic }
        schema '$ref' => '#/definitions/error'
        let(:new_resource) {{
          earnedMembership: {
            memberId: basic.id,
            requirements: create_list(:requirement, 2)
          }
        }}
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '401', 'User unauthenticated' do 
        schema '$ref' => '#/definitions/error'
        let(:new_resource) {{
          earnedMembership: {
            memberId: basic.id,
            requirements: create_list(:requirement, 2)
          }
        }}
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '404', 'EarnedMembership not found' do 
        before { sign_in admin }
        schema '$ref' => '#/definitions/error'
        let(:new_resource) {{
          earnedMembership: {
            memberId: basic.id,
            requirements: create_list(:requirement, 2)
          }
        }}
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end