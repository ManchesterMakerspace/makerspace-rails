require 'rails_helper'

RSpec.describe Admin::MembersController, type: :controller do

  let(:valid_attributes) {
    {
      firstname: 'Test',
      lastname: 'Tester',
      email: 'test@test.com',
      expirationTime: (Time.now + 1.month).to_i * 1000,
      renew: 1
    }
  }

  # let(:invalid_attributes) {
  #   {
  #     firstname: 'Test',
  #     lastname: 'Tester',
  #     email: 'test@test.com',
  #     renew: 1
  #   }
  # }

  def get_fullname(member)
    return member[:firstname] + " " + member[:lastname]
  end

  describe "Authenticated admin" do
    login_admin

    describe "POST #create" do
      context "with valid params" do
        it "creates a new member" do
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
          expect(response).to have_http_status(200)
          expect(response.content_type).to eq "application/json"
          expect(parsed_response['member']['id']).to eq(Member.last.id.as_json)
        end
      end

      # context "with invalid params" do
      #   it "assigns a newly created but unsaved member as @member" do
      #     post :create, params: {member: invalid_attributes}, format: :json
      #     expect(assigns(:member)).to be_a(Member)
      #     expect(assigns(:member)).not_to be_persisted
      #   end

      #   it "Returns 500 status" do
      #     post :create, params: {member: invalid_attributes}, format: :json
      #     expect(response).to have_http_status(500)
      #   end
      # end
    end

    describe "PUT #update" do
      context "with valid params" do
        let(:new_attributes) {
          {
            email: 'new_email@test.com',
            firstname: 'Change',
            lastname: 'Name',
            renew: 1
          }
        }

        it "updates the requested member" do
          member = Member.create valid_attributes
          put :update, params: {id: member.to_param, member: new_attributes}, format: :json
          member.reload
          expect(member.email).to eq(new_attributes[:email])
          expect(member.fullname).to eq(get_fullname(new_attributes))
        end

        it "renders json of the member" do
          member = Member.create valid_attributes
          put :update, params: {id: member.to_param, member: new_attributes}, format: :json

          parsed_response = JSON.parse(response.body)
          expect(response).to have_http_status(200)
          expect(response.content_type).to eq "application/json"
          expect(parsed_response['member']['id']).to eq(member.id.as_json)
        end

        it "Sends slack notification if member renewed" do
          member = Member.create valid_attributes
          slack_message = {
            channel: 'test_channel',
            text: "foo",
            as_user: false,
            username: 'Management Bot',
            icon_emoji: ':ghost:'
          }
          Slack::Web::Client.any_instance.stub(:chat_postMessage)
          put :update, params: {id: member.to_param, member: new_attributes}, format: :json
          expect(assigns(:client)).to be_a(Slack::Web::Client)
          expect(assigns(:client)).to have_received(:chat_postMessage)
        end
      end
    end
  end
end
