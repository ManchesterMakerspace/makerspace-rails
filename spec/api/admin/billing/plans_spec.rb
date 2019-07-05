require 'swagger_helper'

describe 'Plans API', type: :request do
  let(:gateway) { double }
  let(:plans) { build_list(:plan, 3) }
  let(:admin) { create(:member, :admin) }
  let(:basic) { create(:member) }
  let(:discounts) { build_list(:discount, 3) }
  before do 
    create(:permission, member: admin, name: :billing, enabled: true )
    create(:permission, member: basic, name: :billing, enabled: true )
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
    allow(::BraintreeService::Plan).to receive(:get_plans).with(gateway).and_return(plans)
    allow(::BraintreeService::Discount).to receive(:get_discounts).with(gateway).and_return(discounts)
  end

  path '/admin/billing/plans' do 
    get 'Gets a list of billing plans' do 
      tags 'Plans'
      operationId "adminListBillingPlans"
      parameter name: :pageNum, in: :query, type: :integer, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false
      parameter name: :types, in: :query, schema: {
        type: :array,
        items: { type: :string }
      }, required: false

      response '200', 'billing plans found' do 
        before { sign_in admin }

        schema type: :object,
        properties: {
          plans: { 
            type: :array,
            items: { '$ref' => '#/definitions/Plan' }
          }
        },
        required: [ 'plans' ]

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
  end

  path '/admin/billing/plans/discounts' do 
    get 'Gets a list of billing plan discounts' do 
      tags 'Discounts'
      operationId "adminListBillingPlanDiscounts"
      parameter name: :pageNum, in: :query, type: :integer, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false
      parameter name: :subscriptionOnly, in: :query, type: :boolean, required: false
      parameter name: :types, in: :query, schema: {
        type: :array,
        items: { type: :string }
      }, required: false

      response '200', 'billing plan discounts found' do 
        before { sign_in admin }
        schema type: :object,
        properties: {
          discounts: { 
            type: :array,
            items: { '$ref' => '#/definitions/Discount' }
          }
        },
        required: [ 'discounts' ]

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
  end
end