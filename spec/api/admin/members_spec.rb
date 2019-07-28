require 'swagger_helper'

describe 'Admin::Members API', type: :request do
  let(:admin) { create(:member, :admin) }
  let(:basic) { create(:member) }
  let(:members) { build_list(:member, 3) }

  path '/admin/members' do
    post 'Creates a member' do
      tags 'Members'
      operationId "adminCreateMember"
      parameter name: :createMemberDetails, in: :body, schema: {
        type: :object,
        properties: {
          member: { '$ref' => '#/definitions/NewMember'   }
        }
      }, required: true

      response '200', 'member created' do
        before { sign_in admin }

        schema type: :object,
        properties: {
          member: { '$ref' => '#/definitions/Member' },
        },
        required: [ 'member' ]

        let(:createMemberDetails) {{
          member: {
            firstname: "first",
            lastname: "last",
            email: "foo@foo.com",
            expirationTime: Time.now.to_i * 1000,
            memberContractOnFile: true
          }
        }}

        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/definitions/error'
        let(:createMemberDetails) {{
          member: {
            firstname: "first",
            lastname: "last",
            email: "foo@foo.com",
            expirationTime: Time.now.to_i * 1000,
            memberContractOnFile: true
          }
        }}
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/definitions/error'
        let(:createMemberDetails) {{
          member: {
            firstname: "first",
            lastname: "last",
            email: "foo@foo.com",
            expirationTime: Time.now.to_i * 1000,
            memberContractOnFile: true
          }
        }}
        run_test!
      end
    end
  end

  path "/admin/members/{id}" do
    put 'Updates a member' do
      tags 'Members'
      operationId "adminUpdateMember"
      parameter name: :id, in: :path, type: :string

      parameter name: :updateMemberDetails, in: :body, schema: {
        type: :object,
        properties: {
          member: { '$ref' => '#/definitions/Member'   }
        }
      }, required: true

      response '200', 'member updated' do
        before { sign_in admin }

        schema type: :object,
        properties: {
          member: { '$ref' => '#/definitions/Member' },
        },
        required: [ 'member' ]

        let(:updateMemberDetails) {{
          member: {
            firstname: "first",
            lastname: "last",
            email: "foo@foo.com",
            expirationTime: Time.now.to_i * 1000,
            memberContractOnFile: true
          }
        }}
        let(:id) { create(:member).id }
        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/definitions/error'
        let(:updateMemberDetails) {{
          member: {
            firstname: "first",
            lastname: "last",
            email: "foo@foo.com",
            expirationTime: Time.now.to_i * 1000,
            memberContractOnFile: true
          }
        }}
        let(:id) { create(:member).id }
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/definitions/error'
        let(:updateMemberDetails) {{
          member: {
            firstname: "first",
            lastname: "last",
            email: "foo@foo.com",
            expirationTime: Time.now.to_i * 1000,
            memberContractOnFile: true
          }
        }}
        let(:id) { create(:member).id }
        run_test!
      end

      response '404', 'Member not found' do
        before { sign_in admin }
        schema '$ref' => '#/definitions/error'
        let(:updateMemberDetails) {{
          member: {
            firstname: "first",
            lastname: "last",
            email: "foo@foo.com",
            expirationTime: Time.now.to_i * 1000,
            memberContractOnFile: true
          }
        }}
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end