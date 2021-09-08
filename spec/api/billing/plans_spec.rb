require 'swagger_helper'

describe 'Plans API', type: :request do
  let(:gateway) { double }
  let(:plans) { build_list(:plan, 3) }
  let(:basic) { create(:member) }
  before do 
    create(:permission, member: basic, name: :billing, enabled: true )
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
    allow(::BraintreeService::Plan).to receive(:get_plans).with(gateway).and_return(plans)
  end

  path '/billing/plans' do 
    get 'Gets a list of billing plans' do 
      tags 'Plans'
      operationId "listBillingPlans"
      parameter name: :pageNum, in: :query, type: :number, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false
      parameter name: :types, in: :query, schema: { type: :array, items: { type: :string } }, required: false

      response '200', 'billing plans found' do 
        schema type: :array,
            items: { '$ref' => '#/components/schemas/Plan' }

        run_test!
      end
    end
  end
end