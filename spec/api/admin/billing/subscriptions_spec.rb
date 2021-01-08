require 'swagger_helper'

describe 'Billing::Subscriptions API', type: :request do
  let(:admin) { create(:member, :admin) }
  let(:basic) { create(:member) }
  let(:success_result) { double("success", success?: true )}

  let(:invoice) { create(:invoice, member: basic) }
  let(:subscriptions) { build_list(:subscription, 3, id: invoice.generate_subscription_id) }
  let(:gateway) { double }
  before do 
    create(:permission, member: admin, name: :billing, enabled: true )
    create(:permission, member: basic, name: :billing, enabled: true )
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
  end

  path '/admin/billing/subscriptions' do 
    get 'Lists subscription' do 
      tags 'Subscriptions'
      operationId "adminListSubscriptions"
      parameter name: :startDate, in: :query, type: :string, required: false
      parameter name: :endDate, in: :query, type: :string, required: false
      parameter name: :search, in: :query, type: :string, required: false
      parameter name: :planId, in: :query, schema: { type: :array, items: { type: :string } }, required: false
      parameter name: :subscriptionStatus, in: :query, schema: { type: :array, items: { type: :string } }, required: false
      parameter name: :customerId, in: :query, type: :string, required: false

      response '200', 'subscription found' do 
        before do 
          sign_in admin
          allow(BraintreeService::Subscription).to receive(:get_subscriptions).with(gateway, anything).and_return(subscriptions)
        end

        schema type: :array,
            items: { '$ref' => '#/components/schemas/Subscription' }

        run_test!
      end

      response '401', 'User not authenticated' do 
        schema '$ref' => '#/components/schemas/error'
        run_test!
      end

      response '403', 'User not authorized' do 
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        run_test!
      end
    end
  end

  path '/admin/billing/subscriptions/{id}' do
    delete 'Cancels a subscription' do 
      let(:subscription) { build(:subscription, id: "foo") }
      before do 
        allow(BraintreeService::Subscription).to receive(:get_subscription).with(gateway, subscription.id).and_return(subscription)
        allow(BraintreeService::Subscription).to receive(:cancel).with(gateway, subscription.id).and_return(success_result)
      end

      tags 'Subscriptions'
      operationId "adminCancelSubscription"
      parameter name: :id, in: :path, type: :string

      response '204', 'refund requested' do
        before { sign_in admin }

        let(:id) { subscription.id }
        run_test!
      end

      response '401', 'User not authenticated' do 
        schema '$ref' => '#/components/schemas/error'
        let(:id) { subscription.id }
        run_test!
      end

      response '403', 'User not authorized' do 
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { subscription.id }
        run_test!
      end
    end
  end
end
