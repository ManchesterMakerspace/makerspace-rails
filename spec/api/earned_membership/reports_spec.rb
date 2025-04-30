require 'swagger_helper'

describe 'Reports API', type: :request do
  path '/earned_memberships/{id}/reports' do
    get 'Gets a list of reports for current member' do
      tags 'Reports'
      operationId "listEarnedMembershipReports"
      parameter name: :id, :in => :path, :type => :string
      parameter name: :pageNum, in: :query, type: :number, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false

      response '200', 'reports found' do
        let(:em) { create(:earned_membership) }
        before { sign_in create(:earned_member, earned_membership: em) }
        schema type: :array,
            items: { '$ref' => '#/components/schemas/Report' }

        let(:id) { em.id }
        run_test!
      end

      response '403', 'Forbidden not an earned member' do
        before { sign_in create(:member) }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '401', "Unauthorized" do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:earned_membership).id }
        run_test!
      end
    end

    post 'Create an report' do
      tags 'Reports'
      operationId 'createEarnedMembershipReport'
      parameter name: :id, :in => :path, :type => :string
      parameter name: :createEarnedMembershipReportDetails, in: :body, schema: {
        title: :createEarnedMembershipReportDetails, 
        '$ref' => '#/components/schemas/NewReport'
      }, required: true

      response '200', 'report created' do
        let(:em) { create(:earned_membership) }
        before { sign_in create(:earned_member, earned_membership: em) }
        schema '$ref' => '#/components/schemas/Report'

        let(:createEarnedMembershipReportDetails) { {
          earnedMembershipId: em.id,
          reportRequirements: [
            {
              requirementId: create(:requirement).id,
              reportedCount: 1,
              memberIds: [],
            },
            {
              requirementId: create(:requirement).id,
              reportedCount: 1,
              memberIds: [],
            }
          ]
        } }

        let(:id) { em.id }

        run_test!
      end

      response '403', 'unauthorized' do
        before { sign_in create(:member) }
        schema '$ref' => '#/components/schemas/error'

        let(:createEarnedMembershipReportDetails) { {
          earnedMembershipId: "foo",
          reportRequirements: [
            {
              requirementId: "req 1",
              reportedCount: 1,
            },
            {
              requirementId: "req 2",
              reportedCount: 1,
            }
          ]
        } }
        let(:id) { create(:earned_membership).id }
        run_test!
      end
    end
  end
end
