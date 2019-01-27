require 'rails_helper'

RSpec.describe MembersController, type: :controller do

  describe "GET #index" do
    it "assigns all members as @members" do
      member = create(:member)
      get :index, params: {}, format: :json
      expect(assigns(:members)).to eq([member])
    end

    it "renders json of all members" do
      member = create(:member)
      get :index, params: {}, format: :json

      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      expect(parsed_response['members'].first['id']).to eq(Member.last.id.as_json)
    end
  end

  describe "GET #show" do
    it "assigns the requested member as @member" do
      member = create(:member)
      get :show, params: {id: member.to_param}, format: :json
      expect(assigns(:member)).to eq(member)
    end

    it "renders json of the retrieved member" do
      member = create(:member)
      get :show, params: {id: member.to_param}, format: :json

      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      expect(parsed_response['member']['id']).to eq(Member.last.id.as_json)
    end
  end
end
