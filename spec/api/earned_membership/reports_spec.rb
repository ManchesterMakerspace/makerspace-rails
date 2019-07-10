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
        schema type: :object,
        properties: {
          reports: { 
            type: :array,
            items: { '$ref' => '#/definitions/Report' }
          }
        },
        required: [ 'reports' ]

        let(:id) { em.id }        
        run_test!
      end

      response '403', 'Forbidden not an earned member' do 
        before { sign_in create(:member) }
        schema '$ref' => '#/definitions/error'
        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '401', "Unauthorized" do 
        schema '$ref' => '#/definitions/error'
        let(:id) { create(:earned_membership).id }
        run_test!
      end
    end
    
    post 'Create an report' do 
      tags 'Reports'
      operationId 'createEarnedMembershipReport'
      parameter name: :id, :in => :path, :type => :string
      parameter name: :createEarnedMembershipReportDetails, in: :body, schema: {
        type: :object,
        properties: {
          report: {
            type: :object,
            properties: {
              earnedMembershipId: { type: :string },
              reportRequirements: {
                type: :array,
                items: {
                  type: :object,
                  properties: {
                    requirementId: { type: :string },
                    reportedCount: { type: :number },
                    memberIds: { type: :array, items: { type: :string } }
                  }
                }
              }
            },
            required: [:earnedMembershipId, :reportRequirements]
          }
        }
      }, required: true

      response '200', 'report created' do 
        let(:em) { create(:earned_membership) }
        before { sign_in create(:earned_member, earned_membership: em) }
        schema type: :object,
        properties: {
          report: { 
            '$ref' => '#/definitions/Report'
          }
        },
        required: [ 'report' ]

        let(:createEarnedMembershipReportDetails) { {
          report: { 
            earnedMembershipId: em.id,
            reportRequirements: [
              {
                requirementId: create(:requirement).id,
                reportedCount: 1,
              },
              {
                requirementId: create(:requirement).id,
                reportedCount: 1,
              }
            ]
          }
        } }

        let(:id) { em.id }        

        run_test!
      end

      response '403', 'unauthorized' do 
        before { sign_in create(:member) }
        schema '$ref' => '#/definitions/error'

        let(:createEarnedMembershipReportDetails) { {
          report: { 
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
          }
        } }
        let(:id) { create(:earned_membership).id }
        run_test!
      end
    end
  end
end