require 'swagger_helper'

describe 'Admin::Rentals API', type: :request do
  let(:admin) { create(:member, :admin) }
  let(:basic) { create(:member) }
  let(:rentals) { build_list(:rental, 3, member: create(:member)) }

  path '/admin/rentals' do 
    get 'Gets a list of rentals' do 
      tags 'Rentals'
      operationId "amdinListRentals"
      parameter name: :pageNum, in: :query, type: :number, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false
      parameter name: :memberId, in: :query, type: :string, required: false

      response '200', 'rentals found' do 
        before { sign_in admin }
        schema type: :object,
        properties: {
          rentals: { 
            type: :array,
            items: { '$ref' => '#/definitions/Rental' }
          }
        },
        required: [ 'rentals' ]

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

    post 'Creates a rental' do 
      tags 'Rentals'
      operationId "adminCreateRental"
      parameter name: :createRentalDetails, in: :body, schema: {
        type: :object,
        properties: {
          rental: { '$ref' => '#/definitions/Rental'   }
        }
      }, required: true

      response '200', 'rental created' do 
        before { sign_in admin }

        schema type: :object,
        properties: {
          rental: { '$ref' => '#/definitions/Rental' },
        },
        required: [ 'rental' ]

        let(:createRentalDetails) {{
          rental: {
            number: "something",
            description: "some description",
            expiration: (Time.now + 1.month).to_i * 1000,
            memberId: basic.id
          }
        }}

        run_test!
      end

      response '403', 'User unauthorized' do 
        before { sign_in basic }
        schema '$ref' => '#/definitions/error'
        let(:createRentalDetails) {{
          rental: {
            number: "something",
            description: "some description",
            expiration: (Time.now + 1.month).to_i * 1000
          }
        }}
        run_test!
      end

      response '401', 'User unauthenticated' do 
        schema '$ref' => '#/definitions/error'
        let(:createRentalDetails) {{
          rental: {
            number: "something",
            description: "some description",
            expiration: (Time.now + 1.month).to_i * 1000
          }
        }}
        run_test!
      end
    end
  end

  path "/admin/rentals/{id}" do 
    put 'Updates a rental' do 
      tags 'Rentals'
      operationId "adminUpdateRental"
      parameter name: :id, in: :path, type: :string

      parameter name: :new_resource, in: :body, schema: {
        type: :object,
        properties: {
          rental: { '$ref' => '#/definitions/Rental'   }
        }
      }, required: true

      response '200', 'rental updated' do 
        before { sign_in admin }

        schema type: :object,
        properties: {
          rental: { '$ref' => '#/definitions/Rental' },
        },
        required: [ 'rental' ]

        let(:new_resource) {{
          rental: {
            number: "something",
            description: "some description",
            expiration: (Time.now + 1.month).to_i * 1000
          }
        }}
        let(:id) { create(:rental, member: basic).id }
        run_test!
      end

      response '403', 'User unauthorized' do 
        before { sign_in basic }
        schema '$ref' => '#/definitions/error'
        let(:new_resource) {{
          rental: {
            number: "something",
            description: "some description",
            expiration: (Time.now + 1.month).to_i * 1000
          }
        }}
        let(:id) { create(:rental).id }
        run_test!
      end

      response '401', 'User unauthenticated' do 
        schema '$ref' => '#/definitions/error'
        let(:new_resource) {{
          rental: {
            number: "something",
            description: "some description",
            expiration: (Time.now + 1.month).to_i * 1000
          }
        }}
        let(:id) { create(:rental).id }
        run_test!
      end

      response '404', 'Rental not found' do 
        before { sign_in admin }
        schema '$ref' => '#/definitions/error'
        let(:new_resource) {{
          rental: {
            number: "something",
            description: "some description",
            expiration: (Time.now + 1.month).to_i * 1000
          }
        }}
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end