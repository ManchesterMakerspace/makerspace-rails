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
        title: :createMemberDetails,
        '$ref' => '#/components/schemas/NewMember'
      }, required: true

      request_body_json schema: {
        title: :createMemberDetails,
        '$ref' => '#/components/schemas/NewMember'
      }, required: true

      response '200', 'member created' do
        before { sign_in admin }

        schema '$ref' => '#/components/schemas/Member'

        let(:createMemberDetails) {{
          firstname: "first",
          lastname: "last",
          email: "foo@foo.com",
          memberContractOnFile: true,
          phone: "867-5309",
          address: {
            street: "123 Foo St",
            city: "Roswell",
            state: "NM",
            postal_code: "who knows"
          }
        }}

        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:createMemberDetails) {{
          firstname: "first",
          lastname: "last",
          email: "foo@foo.com",
          memberContractOnFile: true,
          phone: "867-5309",
          address: {
            street: "123 Foo St",
            city: "Roswell",
            state: "NM",
            postal_code: "who knows"
          }
        }}
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:createMemberDetails) {{
          firstname: "first",
          lastname: "last",
          email: "foo@foo.com",
          phone: "867-5309",
          memberContractOnFile: true,
          address: {
            street: "123 Foo St",
            city: "Roswell",
            state: "NM",
            postal_code: "who knows"
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
        title: :updateMemberDetails,
        '$ref' => '#/components/schemas/AdminUpdateMemberDetails'
      }, required: true

      request_body_json schema: {
        title: :updateMemberDetails,
        '$ref' => '#/components/schemas/AdminUpdateMemberDetails'
      }, required: true

      response '200', 'member updated' do
        before { sign_in admin }

        schema '$ref' => '#/components/schemas/Member'

        let(:updateMemberDetails) {{
          firstname: "first",
          lastname: "last",
          email: "foo@foo.com",
          expirationTime: Time.now.to_i * 1000,
          memberContractOnFile: true
        }}
        let(:id) { create(:member).id }
        run_test!
      end

      response '403', 'User unauthorized' do
        before { sign_in basic }
        schema '$ref' => '#/components/schemas/error'
        let(:updateMemberDetails) {{
          firstname: "first",
          lastname: "last",
          email: "foo@foo.com",
          expirationTime: Time.now.to_i * 1000,
          memberContractOnFile: true
        }}
        let(:id) { create(:member).id }
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:updateMemberDetails) {{
          firstname: "first",
          lastname: "last",
          email: "foo@foo.com",
          expirationTime: Time.now.to_i * 1000,
          memberContractOnFile: true
        }}
        let(:id) { create(:member).id }
        run_test!
      end

      response '404', 'Member not found' do
        before { sign_in admin }
        schema '$ref' => '#/components/schemas/error'
        let(:updateMemberDetails) {{
          firstname: "first",
          lastname: "last",
          email: "foo@foo.com",
          expirationTime: Time.now.to_i * 1000,
          memberContractOnFile: true
        }}
        let(:id) { 'invalid' }
        run_test!
      end
    end
  end
end