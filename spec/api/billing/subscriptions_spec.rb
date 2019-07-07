require 'swagger_helper'

describe 'Billing::Subscriptions API', type: :request do
  let(:sub_customer) { create(:member, customer_id: "foo") }
  let(:invoice) { create(:invoice, member: sub_customer) }
  let(:subscription) { build(:subscription, id: invoice.generate_subscription_id) }
  let(:customer) { create(:member, customer_id: "foobar") }
  let(:non_customer) { create(:member) }
  let(:gateway) { double }
  before do 
    sub_customer.update(subscription_id: subscription.id)
    create(:permission, member: sub_customer, name: :billing, enabled: true )
    create(:permission, member: customer, name: :billing, enabled: true )
    create(:permission, member: non_customer, name: :billing, enabled: true )
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
  end

  path '/billing/subscriptions/{id}' do 
    get 'Gets a subscription' do 
      tags 'Subscriptions'
      operationId "listSubscriptions"
      parameter name: :id, in: :path, type: :string

      response '200', 'subscription found' do 
        before do 
          sign_in sub_customer
          allow(BraintreeService::Subscription).to receive(:get_subscription).with(gateway, subscription.id).and_return(subscription)
        end

        schema type: :object,
        properties: {
          subscription: {
            '$ref' => '#/definitions/Subscription'
          }
        },
        required: [ 'subscription' ]
        let(:id) { subscription.id }

        run_test!
      end

      response '401', 'User not authenticated' do 
        schema '$ref' => '#/definitions/error'
        let(:id) { subscription.id }
        run_test!
      end

      response '403', 'User not authorized' do 
        before { sign_in non_customer }
        schema '$ref' => '#/definitions/error'
        let(:id) { subscription.id }
        run_test!
      end

      response '404', 'Subscription not for user' do 
        before { sign_in customer }
        schema '$ref' => '#/definitions/error'
        let(:id) { subscription.id }
        run_test!
      end
    end

    put "Update a subscription" do 
      tags 'Subscriptions'
      operationId "updateSubscription"
      parameter name: :id, in: :path, type: :string
      parameter name: :updateSubscriptionDetails, in: :body, schema: {
        type: :object,
        properties: {
          subscription: {
            type: :object,
            properties: {
              payment_method_token: { type: :string }
            },
            required: [:payment_method_token]
          }
        },
        required: [:subscription]
      }

      response '200', 'subscription updated' do 
        before do 
          sign_in sub_customer
          allow(BraintreeService::Subscription).to receive(:update).and_return(subscription)
        end

        schema type: :object,
        properties: {
          subscription: {
            '$ref' => '#/definitions/Subscription'
          }
        },
        required: [ 'subscription' ]
        let(:id) { subscription.id }
        let(:updateSubscriptionDetails) {{ subscription: { payment_method_token: "54321" } }}

        run_test!
      end

      response '401', 'User not authenticated' do 
        schema '$ref' => '#/definitions/error'
        let(:id) { subscription.id }
        let(:updateSubscriptionDetails) {{ subscription: { payment_method_token: "54321" } }}
        run_test!
      end

      response '403', 'User not authorized' do 
        before { sign_in non_customer }
        schema '$ref' => '#/definitions/error'
        let(:id) { subscription.id }
        let(:updateSubscriptionDetails) {{ subscription: { payment_method_token: "54321" } }}
        run_test!
      end

      response '404', 'Subscription not for user' do 
        before { sign_in customer }
        schema '$ref' => '#/definitions/error'
        let(:id) { subscription.id }
        let(:updateSubscriptionDetails) {{ subscription: { payment_method_token: "54321" } }}
        run_test!
      end
    end

    delete 'Cancels a subscription' do 
      let(:subscription) { build(:subscription, id: "foo") }
      before do 
        allow(BraintreeService::Subscription).to receive(:cancel).with(gateway, subscription.id)
      end

      tags 'Subscriptions'
      operationId "cancelSubscription"
      parameter name: :id, in: :path, type: :string

      response '204', 'refund requested' do
        before { sign_in sub_customer }

        let(:id) { subscription.id }
        run_test!
      end

      response '401', 'User not authenticated' do 
        schema '$ref' => '#/definitions/error'
        let(:id) { subscription.id }
        run_test!
      end

      response '403', 'User not authorized' do 
        before { sign_in non_customer }
        schema '$ref' => '#/definitions/error'
        let(:id) { subscription.id }
        run_test!
      end

      response '404', 'Subscription not for user' do 
        before { sign_in customer }
        schema '$ref' => '#/definitions/error'
        let(:id) { subscription.id }
        run_test!
      end
    end
  end
end
