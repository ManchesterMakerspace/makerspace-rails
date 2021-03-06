require 'swagger_helper'

describe 'Admin::EarnedMembership::Report API', type: :request do
  let(:admin) { create(:member, :admin) }
  let(:basic) { create(:member) }

  path '/admin/earned_memberships/{id}/reports' do
    get 'Gets a list of reports' do
      tags 'Reports'
      operationId "adminListEarnedMembershipReports"
      parameter name: :id, in: :path, type: :string
      parameter name: :pageNum, in: :query, type: :number, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false

      response '200', 'reports found' do
        before { sign_in admin }
        schema type: :array,
            items: { '$ref' => '#/components/schemas/Report' }

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

      response '404', 'Earned membership not found' do
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end