require 'swagger_helper'

describe 'EarnedMemberships API' do
  path '/earned_memberships/{id}' do
    get 'Gets a invoice' do 
      tags 'Invoices'
      parameter name: :id, in: :path, type: :string

      response '200', 'invoice found' do
        schema type: :object,
          properties: {
            invoice: {
              '$ref' => '#/definitions/Invoice'
            }
          },
          required: [ 'invoice' ]

        let(:id) { create(:earned_membership).id }
        run_test!
      end

      response '404', 'earned membership not found' do
        schema '$ref' => '#/definitions/error'
        let(:id) { 'invalid' }
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
