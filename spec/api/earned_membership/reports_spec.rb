require 'swagger_helper'

describe 'Reports API' do
  path '/earned_memberships/reports' do 
    get 'Gets a list of reports for current member' do 
      tags 'Reports'
      parameter name: :pageNum, in: :query, type: :integer
      parameter name: :orderBy, in: :query, type: :string
      parameter name: :order, in: :query, type: :string

      response '200', 'reports found' do 
        schema type: :object,
        properties: {
          reports: { 
            type: :array,
            items: { '$ref' => '#/definitions/Report' }
          }
        },
        required: [ 'reports' ]

        let(:reports) { create_list(:report) }
        run_test!
      end
    end
    
    post 'Create an report' do 
      tags 'Reports'
      parameter name: :report, in: :body, schema: {
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

      response '200', 'report created' do 
        schema type: :object,
        properties: {
          report: { 
            '$ref' => '#/definitions/Report'
          }
        },
        required: [ 'report' ]

        let(:report) { { 
          earnedMembershipId: create(:earned_membership).id,
          reportRequirements: create_list(:report_requirement).collect do |requirement|
            {
              requirementId: requirement.id,
              reportedCount: 1,
            }
          end
        } }

        run_test!
      end

      response '401', 'unauthorized' do 
        schema '$ref' => '#/definitions/error'

        let(:non_em) { create(:member) }
        let(:id) { non_em.id }
        run_test!
      end
    end
  end
end
