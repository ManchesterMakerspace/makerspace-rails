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

        schema type: :array,
            items: { '$ref' => '#/components/schemas/MemberSummary' }

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

        schema '$ref' => '#/components/schemas/Member'

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
        # TODO: This should use oneOf for signature/member partial
        properties: {
          firstname: { type: :string },
          lastname: { type: :string },
          email: { type: :string },
          memberContractOnFile: { type: :boolean },
          silenceEmails: { type: :boolean },
          phone: { type: :string },
          address: {
            type: :object,
            properties: {
              street: { type: :string },
              unit: { type: :string },
              city: { type: :string },
              state: { type: :string },
              postalCode: { type: :string },
            }
          },
          signature: { type: :string },
        },
      }, required: true

      # Update object
      let(:updateMemberDetails) {{ firstname: "new firstname", lastname: "new lastname", email: "foo@foo.com" }}

      response '200', 'member updated' do
        let(:current_member) { create(:member) }
        before { sign_in current_member }

        schema '$ref' => '#/components/schemas/Member'

        let(:id) { current_member.id }
        run_test!
      end

      response '200', 'Signature upload' do
        let(:current_member) { create(:member) }
        before { sign_in current_member }

        let(:updateMemberDetails) {{ signature: "foobar.png" }}

        schema '$ref' => '#/components/schemas/Member'

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