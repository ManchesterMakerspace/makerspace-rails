require 'swagger_helper'

describe 'Admin::AccessCards API', type: :request do
  let(:admin) { create(:member, :admin) }
  let(:basic) { create(:member) }

  path '/admin/cards/new' do 
    get 'Initiate new card creation' do 
      tags 'Cards'
      operationId "adminGetNewCard"
      response '200', 'Card intilized' do 
        before do 
          sign_in admin 
          create(:rejection_card, timeOf: Time.now)
        end

        schema '$ref' => '#/components/schemas/RejectionCard'

        run_test!
      end

      response '403', 'User unauthorized' do 
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        run_test!
      end

      response '401', 'User unauthenticated' do 
        schema '$ref' => '#/components/schemas/error'
        run_test!
      end
    end
  end

  path '/admin/cards' do 
    get 'Gets a list of members cards' do 
      tags 'Cards'
      operationId "adminListCards"
      parameter name: :memberId, in: :query, type: :string, required: true

      response '200', 'cards found' do 
        before { sign_in admin }
        schema type: :array,
            items: { '$ref' => '#/components/schemas/Card' }

        let(:memberId) { basic.id }

        run_test!
      end

      response '403', 'User unauthorized' do 
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:memberId) { basic.id }
        run_test!
      end

      response '401', 'User unauthenticated' do 
        schema '$ref' => '#/components/schemas/error'
        let(:memberId) { basic.id }
        run_test!
      end

      response '404', 'member not found' do 
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:memberId) { 'invalid' }
        run_test!
      end
    end

    post 'Creates an access card' do 
      tags 'Cards'
      operationId "adminCreateCard"
      parameter name: :createAccessCardDetails, in: :body, schema: {
        title: :createAccessCardDetails,
        type: :object,
        properties: {
          memberId: { type: :string },
          uid: { type: :string },
        },
        required: [:memberId, :uid]
      }, required: true

      request_body_json schema: {
        title: :createAccessCardDetails,
        name: :createAccessCardDetails,
        type: :object,
        properties: {
          memberId: { type: :string },
          uid: { type: :string },
        },
        required: [:memberId, :uid]
      }, required: true

      response '200', 'access card created' do 
        before { sign_in admin }

        schema '$ref' => '#/components/schemas/Card'

        let(:createAccessCardDetails) {{
          memberId: basic.id,
          uid: "12ggh34"
        }}

        run_test!
      end

      response '403', 'User unauthorized' do 
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:createAccessCardDetails) {{
          memberId: basic.id,
          uid: "12ggh34"
        }}
        run_test!
      end

      response '401', 'User unauthenticated' do 
        schema '$ref' => '#/components/schemas/error'
        let(:createAccessCardDetails) {{
          memberId: basic.id,
          uid: "12ggh34"
        }}
        run_test!
      end

      response '422', 'missing parameter' do 
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:createAccessCardDetails) {{
          uid: "12ggh34"
        }}
        run_test!
      end

      response '404', 'member not found' do 
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:createAccessCardDetails) {{
          memberId: 'invalid',
          uid: "12ggh34"
        }}
        run_test!
      end
    end
  end

  path "/admin/cards/{id}" do 
    put 'Updates a card' do 
      tags 'Cards'
      operationId "adminUpdateCard"
      parameter name: :id, in: :path, type: :string

      parameter name: :updateAccessCardDetails, in: :body, schema: {
        title: :updateAccessCardDetails,
        type: :object,
        properties: {
          cardLocation: { type: :string }
        },
        required: [:cardLocation]
      }, required: true

      request_body_json schema: {
        title: :updateAccessCardDetails,
        type: :object,
        properties: {
          cardLocation: { type: :string }
        },
        required: [:cardLocation]
      }, required: true

      response '200', 'card updated' do 
        before { sign_in admin }

        schema '$ref' => '#/components/schemas/Card'

        let(:updateAccessCardDetails) {{
          cardLocation: "lost"
        }}
        let(:id) { create(:card, member: basic).id }
        run_test!
      end

      response '403', 'User unauthorized' do 
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:updateAccessCardDetails) {{
          cardLocation: "lost"
        }}
        let(:id) { create(:card).id }
        run_test!
      end

      response '401', 'User unauthenticated' do 
        schema '$ref' => '#/components/schemas/error'
        let(:updateAccessCardDetails) {{
          cardLocation: "lost"
        }}
        let(:id) { create(:card).id }
        run_test!
      end

      response '404', 'Invoice not found' do 
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:updateAccessCardDetails) {{
          cardLocation: "lost"
        }}
        let(:id) { 'card' }
        run_test!
      end
    end
  end
end