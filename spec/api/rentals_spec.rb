require 'swagger_helper'

describe 'Rentals API', type: :request do
  path '/rentals' do 
    get 'Gets a list of rentals' do 
      tags 'Rentals'
      operationId "listRentals"
      parameter name: :pageNum, in: :query, type: :number, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false

      response '200', 'rentals found' do 
        before { sign_in create(:member) }

        schema type: :array,
            items: { '$ref' => '#/components/schemas/Rental' }

        let(:rentals) { create_list(:rental) }
        run_test!
      end
    end
  end

  path '/rentals/{id}' do
    get 'Gets a rental' do 
      tags 'Rentals'
      operationId "getRental"
      parameter name: :id, in: :path, type: :string

      response '200', 'rental found' do
        let(:current_member) { create(:member) }
        before { sign_in current_member }
        let(:id) { create(:rental, member: current_member).id }

        schema '$ref' => '#/components/schemas/Rental'

        run_test!
      end

      response '404', 'rental not found' do
        before { sign_in create(:member) }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { 'invalid' }
        run_test!
      end

      response '401', 'User not authenciated' do 
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:rental).id }
        run_test!
      end
    end

    put 'Updates a rental and uploads signature' do
      tags 'Rentals'
      operationId "updateRental"
      parameter name: :id, in: :path, type: :string
      parameter name: :updateRentalDetails, in: :body, schema: {
        title: :updateRentalDetails,
        type: :object,
        properties: {
          signature: { type: :string, 'x-nullable': true }
        },
        required: [:signature]
      }, required: true

      request_body_json schema: {
        title: :updateRentalDetails,
        type: :object,
        properties: {
          signature: { type: :string, 'x-nullable': true }
        },
        required: [:signature]
      }, required: true

      # Update object
      let(:updateRentalDetails) {{ signature: "foobar" }}

      response '200', 'rental updated' do
        let(:current_member) { create(:member) }
        let(:rental) { create(:rental, member: current_member) }
        before { sign_in current_member }

        schema '$ref' => '#/components/schemas/Rental'

        let(:id) { rental.id }
        run_test!
      end

      response '403', "Forbidden updating different member's rental" do
        let(:current_member) { create(:member) }
        let(:other_user) { create(:member) }
        let(:rental) { create(:rental, member: other_user) }
        before { sign_in current_member }

        schema '$ref' => '#/components/schemas/error'

        let(:id) { rental.id }
        run_test!
      end

      response '401', 'User not authenciated or authorized' do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:rental).id }
        run_test!
      end

      response '404', 'Rental not found' do
        before { sign_in create(:member) }
        schema '$ref' => '#/components/schemas/error'

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end
