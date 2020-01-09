require 'swagger_helper'

describe 'Analytics API', type: :request do
  let(:admin) { create(:member, :admin) }

  path '/admin/analytics' do
    get 'Lists analytic counts' do
      tags 'Analytics'
      operationId "listAnalytics"


      response '200', 'analytics read' do
        before { sign_in admin }

        schema type: :object,
        properties: {
          analytics: {
            type: :object,
            properties: {
              totalMembers: { type: :number },
              newMembers: { type: :number },
              subscribedMembers: { type: :number },
              pastDueInvoices: { type: :number },
              refundsPending: { type: :number },
            }
          }
        },
        required: [ 'analytics' ]

        let(:rentals) { create_list(:rental) }
        let(:members) { create_list(:member) }
        let(:invoices) { create_list(:invoice) }
        run_test!
      end
    end
  end
end
