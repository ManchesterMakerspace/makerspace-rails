require 'rails_helper'

RSpec.describe MembersController, type: :controller do
  describe "GET #index" do
    login_user
    it "renders json of all members" do
      member = create(:member)
      get :index, params: {}, format: :json

      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      expect(parsed_response['members'].last['id']).to eq(Member.last.id.as_json)
    end
  end

  describe "GET #show" do
    login_user
    it "renders json of the retrieved member" do
      member = create(:member)
      get :show, params: {id: member.to_param}, format: :json

      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      expect(parsed_response['member']['id']).to eq(Member.last.id.as_json)
    end

    it "raises not found if member doens't exist" do
      get :show, params: {id: "foo" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(404)
    end
  end

  describe "PUT #update" do
    let!(:current_user) { create(:member) }
    member_params = {
      firstname: "foo"
    }
    before(:each) do
      sign_in current_user
    end

    it "renders json of the updated member" do
      member_params = {
        firstname: "foo"
      }
      put :update, params: { id: current_user.id, member: member_params }, format: :json
      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['member']['id']).to eq(current_user.id.as_json)
      expect(parsed_response['member']['firstname']).to eq("foo")
    end

    it "raises unauthed if not updating current member" do
      member = create(:member)
      put :update, params: { id: member.id, member: member_params }, format: :json
      expect(response).to have_http_status(401)
    end

    it "raises not found if member doens't exist" do
      put :update, params: {id: "foo" }, format: :json
      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(404)
    end
  end
end
