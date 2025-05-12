require 'swagger_helper'

describe 'Admin::EarnedMemberships API', type: :request do
  let(:admin) { create(:member, :admin) }
  let(:basic) { create(:member) }
  path '/admin/earned_memberships' do
    get 'Gets a list of earned memberships' do
      tags 'EarnedMemberships'
      operationId "adminListEarnedMemberships"
      parameter name: :pageNum, in: :query, type: :number, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false

      response '200', 'earned memberships found' do
        before { sign_in admin }
        schema type: :array,
            items: { '$ref' => '#/components/schemas/EarnedMembership' }

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

    post 'Creates an earned membership' do
      tags 'EarnedMemberships'
      operationId "adminCreateEarnedMembership"
      parameter name: :createEarnedMembershipDetails, in: :body, schema: {
        title: :createEarnedMembershipDetails, 
        '$ref' => '#/components/schemas/NewEarnedMembership'
      }, required: true

      response '200', 'earned membership created' do
        before { sign_in admin }

        schema '$ref' => '#/components/schemas/EarnedMembership'

        let(:createEarnedMembershipDetails) {{
          memberId: basic.id,
          requirements: create_list(:requirement, 2)
        }}

        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:createEarnedMembershipDetails) {{
          memberId: basic.id,
          requirements: create_list(:requirement, 2)
        }}
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:createEarnedMembershipDetails) {{
          memberId: basic.id,
          requirements: create_list(:requirement, 2)
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

        schema '$ref' => '#/components/schemas/EarnedMembership'

        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '404', 'EarnedMembership not found' do
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { 'invalid' }
        run_test!
      end
    end

    put 'Updates an earned membership' do
      tags 'EarnedMemberships'
      operationId "adminUpdateEarnedMembership"
      parameter name: :id, in: :path, type: :string

      parameter name: :updateEarnedMembershipDetails, in: :body, schema: {
        title: :updateEarnedMembershipDetails,
        '$ref' => '#/components/schemas/EarnedMembership'
      }, required: true

      response '200', 'earned membership updated' do
        before { sign_in admin }

        schema '$ref' => '#/components/schemas/EarnedMembership'

        let(:updateEarnedMembershipDetails) {{
          memberId: basic.id,
          requirements: create_list(:requirement, 2)
        }}
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:updateEarnedMembershipDetails) {{
          memberId: basic.id,
          requirements: create_list(:requirement, 2)
        }}
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:updateEarnedMembershipDetails) {{
          memberId: basic.id,
          requirements: create_list(:requirement, 2)
        }}
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '404', 'EarnedMembership not found' do
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:updateEarnedMembershipDetails) {{
          memberId: basic.id,
          requirements: create_list(:requirement, 2)
        }}
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end