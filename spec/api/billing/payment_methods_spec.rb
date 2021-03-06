require 'swagger_helper'

describe 'Billing::PaymentMethods API', type: :request do
  let(:customer) { create(:member, customer_id: "foo") }
  let(:non_customer) { create(:member) }
  let(:success_result) { double("success", success?: true) }
  let(:gateway) { double }
  let(:payment_method) { build(:credit_card) }
  before do
    create(:permission, member: customer, name: :billing, enabled: true )
    create(:permission, member: non_customer, name: :billing, enabled: true )
    allow_any_instance_of(Service::BraintreeGateway).to receive(:connect_gateway).and_return(gateway)
  end

  path '/billing/payment_methods/new' do
    get 'Initiate new payment method creation' do
      tags 'PaymentMethods'
      operationId "getNewPaymentMethod"
      response '200', 'Token created' do
        before do
          sign_in customer
          allow(gateway).to receive_message_chain(:client_token, :generate).and_return("1234")
        end

        schema type: :object,
        properties: {
          clientToken: {
            type: :string,
          }
        },
        required: [ 'clientToken' ]

        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/components/schemas/error'
        run_test!
      end
    end
  end

  path '/billing/payment_methods' do
    get 'Gets a list of payment_methods' do
      tags 'PaymentMethods'
      operationId "listPaymentMethods"

      response '200', 'payment_methods found' do
        let(:invoice) { create(:invoice, member: customer)}
        let(:payment_methodss) { build_list(:credit_card, 3) }
        before do
          sign_in customer
          allow(BraintreeService::PaymentMethod).to receive(:get_payment_methods_for_customer).with(gateway, "foo").and_return(payment_methodss)
        end

        schema type: :array,
        items: {
            anyOf: [
            { '$ref' => '#/components/schemas/CreditCard' },
            { '$ref' => '#/components/schemas/PayPalAccount' }
          ]
        }

        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/components/schemas/error'
        run_test!
      end
    end

    post 'Create an payment_method' do
      tags 'PaymentMethods'
      operationId "createPaymentMethod"
      parameter name: :createPaymentMethodDetails, in: :body, schema: {
        title: :createPaymentMethodDetails,
        type: :object,
        properties: {
          paymentMethodNonce: { type: :string },
          makeDefault: { type: :boolean }
        },
        required: [:paymentMethodNonce]
      }, required: true

      request_body_json schema: {
        title: :createPaymentMethodDetails,
        type: :object,
        properties: {
          paymentMethodNonce: { type: :string },
          makeDefault: { type: :boolean }
        },
        required: [:paymentMethodNonce]
      }, required: true

      response '200', 'payment_method created' do
        before do
          sign_in customer
          allow(gateway).to receive_message_chain(:payment_method, :create).and_return(success_result)
          allow(success_result).to receive(:try).and_return(true)
          allow(success_result).to receive(:payment_method).and_return(payment_method)
        end

        schema '$ref' => '#/components/schemas/CreditCard'

        let(:createPaymentMethodDetails) {{ paymentMethodNonce: "1234" }}

        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:createPaymentMethodDetails) {{ paymentMethodNonce: "1234" }}
        run_test!
      end

      response '422', 'parameter missing' do
        before { sign_in customer }
        schema '$ref' => '#/components/schemas/error'
        let(:createPaymentMethodDetails) {{ makeDefault: true }}
        run_test!
      end
    end
  end

  path '/billing/payment_methods/{id}' do
    get 'Get a payment method' do
      before do
        allow(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).with(gateway, payment_method.token, customer.customer_id).and_return(payment_method)
      end

      tags 'PaymentMethods'
      operationId "getPaymentMethod"
      parameter name: :id, in: :path, type: :string

      response '200', 'Payment method deleted' do
        before { sign_in customer }

        schema '$ref' => '#/components/schemas/CreditCard'

        let(:id) { payment_method.token }
        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { payment_method.token }
        run_test!
      end

      response '403', 'User not authorized' do
        before { sign_in non_customer }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { payment_method.token }
        run_test!
      end
    end

    delete 'Deletes a payment method' do
      before do
        allow(BraintreeService::PaymentMethod).to receive(:find_payment_method_for_customer).with(gateway, payment_method.token, customer.customer_id).and_return(payment_method)
        allow(BraintreeService::PaymentMethod).to receive(:delete_payment_method).with(gateway, payment_method.token).and_return(success_result)
      end

      tags 'PaymentMethods'
      operationId "deletePaymentMethod"
      parameter name: :id, in: :path, type: :string

      response '204', 'Payment method deleted' do
        before { sign_in customer }

        let(:id) { payment_method.token }
        run_test!
      end

      response '401', 'User not authenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { payment_method.token }
        run_test!
      end

      response '403', 'User not authorized' do
        before { sign_in non_customer }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { payment_method.token }
        run_test!
      end
    end
  end
end