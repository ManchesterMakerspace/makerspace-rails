require 'rails_helper'

RSpec.describe Admin::MembersController, type: :controller do

  let(:valid_attributes) {
    {
      fullname: 'Test',
      cardID: '1234',
      memberContractOnFile: true,
      email: 'test@test.com',
      password: 'password',
      password_confirmation: 'password',
      # renewal: { months: 1 }
    }
  }

  let(:invalid_attributes) {
    {
      fullname: 'Test',
      cardID: '1234',
      memberContractOnFile: true,
      email: 'test@test.com',
      password: 'password',
      password_confirmation: 'wrong_password',
      renewal: { months: 1 }
    }
  }

  describe "Authenticated admin" do
    login_admin
    describe "POST #create" do
      context "with valid params" do
        it "creates a new Admin::Member" do
          expect {
            post :create, params: {member: valid_attributes}, format: :json
          }.to change(Member, :count).by(1)
        end

        it "assigns a newly created member as @member" do
          post :create, params: {member: valid_attributes}, format: :json
          expect(assigns(:member)).to be_a(Member)
          expect(assigns(:member)).to be_persisted
        end

        it "renders json of the created member" do
          post :create, params: {member: valid_attributes}, format: :json

          parsed_response = JSON.parse(response.body)
          expect(response.status).to eq(200)
          expect(response.content_type).to eq "application/json"
          expect(parsed_response['id']).to eq(Member.last.id.as_json)
        end
      end

      context "with invalid params" do
        it "assigns a newly created but unsaved member as @member" do
          post :create, params: {member: invalid_attributes}, format: :json
          expect(assigns(:member)).to be_a(Member)
          expect(assigns(:member)).not_to be_persisted
        end

        it "Returns 500 status" do
          post :create, params: {member: invalid_attributes}, format: :json
          expect(response.status).to eq(500)
        end
      end
    end

    describe "PUT #update" do
      context "with valid params" do
        let(:new_attributes) {
          {
            email: 'new_email@test.com',
            fullname: 'Change Name'
          }
        }
        let(:renewal) {
          {
            renewal: { months: 1 }
          }
        }

        it "updates the requested member" do
          member = Member.create! valid_attributes
          put :update, params: {id: member.to_param, member: new_attributes}, format: :json
          member.reload
          expect(member.email).to eq(new_attributes[:email])
          expect(member.fullname).to eq(new_attributes[:fullname])
        end

        it "renders json of the member" do
          member = Member.create! valid_attributes
          put :update, params: {id: member.to_param, member: new_attributes}, format: :json

          parsed_response = JSON.parse(response.body)
          expect(response.status).to eq(200)
          expect(response.content_type).to eq "application/json"
          expect(parsed_response['id']).to eq(member.id.as_json)
        end

        it "Sends slack notification if member renewed" do
          member = Member.create! valid_attributes
          put :update, params: {id: member.to_param, member: renewal}, format: :json
          member.reload
          expect(assigns(:notifier)).to be_a(Slack::Notifier)
        end
      end
    end
  end
end
