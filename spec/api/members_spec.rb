require 'swagger_helper'

describe 'Members API', type: :request do
  path '/members' do
    get 'Gets a list of members' do
      tags 'Members'
      operationId "listMembers"
      parameter name: :pageNum, in: :query, type: :number, required: false
      parameter name: :orderBy, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false
      parameter name: :currentMembers, in: :query, type: :boolean, required: false
      parameter name: :search, in: :query, type: :string, required: false

      response '200', 'Members found' do
        let(:members) { create_list(:member) }
        before { sign_in create(:member) }

        schema type: :object,
        properties: {
          members: {
            type: :array,
            items: { '$ref' => '#/components/schemas/MemberSummary' }
          }
        },
        required: [ 'members' ]

        run_test!
      end

      response '401', 'User not authenciated' do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:member).id }
        run_test!
      end
    end
  end

  path '/members/{id}' do
    get 'Gets a member' do
      tags 'Members'
      operationId "getMember"
      parameter name: :id, in: :path, type: :string

      response '200', 'Member found' do
        before { sign_in create(:member) }
        let(:id) { create(:member).id }

        schema type: :object,
          properties: {
            member: {
              '$ref' => '#/components/schemas/Member'
            }
          },
          required: [ 'member' ]

        run_test!
      end

      response '404', 'Member not found' do
        before { sign_in create(:member) }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { 'invalid' }
        run_test!
      end

      response '401', 'User not authenciated' do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:member).id }
        run_test!
      end
    end

    put 'Updates a member and uploads signature' do
      tags 'Members'
      operationId "updateMember"
      parameter name: :id, in: :path, type: :string
      parameter name: :updateMemberDetails, in: :body, schema: {
        title: :updateMemberDetails,
        type: :object,
        properties: {
          member: {
            type: :object,
            properties: {
              firstname: { type: :string, 'x-nullable': true },
              lastname: { type: :string, 'x-nullable': true },
              email: { type: :string, 'x-nullable': true },
              signature: { type: :string, 'x-nullable': true },
              phone: { type: :string, 'x-nullable': true },
              address: {
                type: :object,
                'x-nullable': true,
                properties: {
                  street: { type: :string, 'x-nullable': true },
                  unit: { type: :string,  'x-nullable': true },
                  city: { type: :string, 'x-nullable': true },
                  state: { type: :string, 'x-nullable': true },
                  postalCode: { type: :string, 'x-nullable': true },
                }
              }
            }
          }
        }
      }, required: true

      request_body_json schema: {
        title: :updateMemberDetails,
        type: :object,
        properties: {
          member: {
            type: :object,
            properties: {
              firstname: { type: :string, 'x-nullable': true },
              lastname: { type: :string, 'x-nullable': true },
              email: { type: :string, 'x-nullable': true },
              signature: { type: :string, 'x-nullable': true },
              phone: { type: :string, 'x-nullable': true },
              address: {
                type: :object,
                'x-nullable': true,
                properties: {
                  street: { type: :string, 'x-nullable': true },
                  unit: { type: :string,  'x-nullable': true },
                  city: { type: :string, 'x-nullable': true },
                  state: { type: :string, 'x-nullable': true },
                  postalCode: { type: :string, 'x-nullable': true },
                }
              }
            }
          }
        }
      }, required: true

      # Update object
      let(:updateMemberDetails) {{ firstname: "new firstname", lastname: "new lastname", email: "foo@foo.com" }}

      response '200', 'member updated' do
        let(:current_member) { create(:member) }
        before { sign_in current_member }

        schema type: :object,
          properties: {
            member: {
              '$ref' => '#/components/schemas/Member'
            }
          },
          required: [ 'member' ]

        let(:id) { current_member.id }
        run_test!
      end

      response '403', 'Forbidden updating different member' do
        let(:current_member) { create(:member) }
        before { sign_in current_member }

        schema '$ref' => '#/components/schemas/error'

        let(:other_user) { create(:member) }
        let(:id) { other_user.id }
        run_test!
      end

      response '401', 'User not authenciated or authorized' do
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:member).id }
        run_test!
      end

      response '404', 'member not found' do
        before { sign_in create(:member) }
        schema '$ref' => '#/components/schemas/error'

        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end