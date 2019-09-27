require 'swagger_helper'

describe 'EarnedMemberships API', type: :request do
  path '/earned_memberships/{id}' do
    get 'Gets an earned membership' do 
      tags 'EarnedMemberships'
      operationId "getEarnedMembership"
      parameter name: :id, in: :path, type: :string

      response '200', 'earned membership found' do
        let(:em) { create(:earned_membership) }
        before { sign_in create(:earned_member, earned_membership: em) }
        schema type: :object,
          properties: {
            earnedMembership: {
              '$ref' => '#/definitions/EarnedMembership'
            }
          },
          required: [ 'earnedMembership' ]

        let(:id) { em.id }
        run_test!
      end

      response '404', 'earned membership not found' do
        before { sign_in create(:earned_member) }
        schema '$ref' => '#/definitions/error'
        let(:id) { 'invalid' }
        run_test!
      end

      response '403', 'Forbidden access to different membership' do 
        before { sign_in create(:earned_member) }
        schema '$ref' => '#/definitions/error'

        let(:non_em) { create(:earned_membership) }
        let(:id) { non_em.id }
        run_test!
      end

      response '401', "Unauthorized" do 
        schema '$ref' => '#/definitions/error'
        let(:id) { create(:earned_membership).id }
        run_test!
      end
    end
  end
end
