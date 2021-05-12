require 'swagger_helper'

describe 'Discounts API', type: :request do
  let(:gateway) { double }
  let(:basic) { create(:member) }
  let(:discounts) { build_list(:discount, 3) }
  before do 
    create(:permission, member: basic, name: :billing, enabled: true )
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
    allow(::BraintreeService::Discount).to receive(:get_discounts).with(gateway).and_return(discounts)
  end

  path '/billing/discounts' do 
    get 'Gets a list of discounts' do 
      tags 'Discounts'
      operationId "listBillingDiscounts"
      parameter name: :pageNum, in: :query, type: :number, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false
      parameter name: :subscriptionOnly, in: :query, type: :boolean, required: false
      parameter name: :types, in: :query, schema: { type: :array, items: { type: :string } }, required: false

      response '200', 'billing discounts found' do 
        schema type: :array,
              items: { '$ref' => '#/components/schemas/Discount' }

        run_test!
      end
    end
  end
end