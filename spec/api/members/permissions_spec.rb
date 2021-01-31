require 'swagger_helper'

describe 'Permissions API', type: :request do 
  path '/members/{id}/permissions' do
    get "Gets a member's permissions" do 
      tags 'Permissions'
      operationId "listMembersPermissions"
      parameter name: :id, in: :path, type: :string

      response '200', 'Permissions found' do
        let(:auth_member) { create(:member) }
        before { sign_in auth_member }
        let(:id) { auth_member.id }

        schema type: :object

        run_test!
      end

      response '404', 'Member not found' do
        before { sign_in create(:member) }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { 'invalid' }
        run_test!
      end

      response '403', 'Member not authorized' do
        before { sign_in create(:member) }
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:member).id }
        run_test!
      end

      response '401', 'User not authenciated' do 
        schema '$ref' => '#/components/schemas/error'
        let(:id) { create(:member).id }
        run_test!
      end
    end
  end
end