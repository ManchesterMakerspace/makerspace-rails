require 'rails_helper'

RSpec.describe EarnedMembershipsController, type: :controller do
  describe "Authenticated" do
    let(:current_user) { create(:member) }
    let(:membership) { create(:earned_membership, member: current_user) }

    set_devise_mapping
    before(:each) do
      sign_in current_user
    end
    describe "GET show" do
      it "Raises 403 if not current user's earned membership" do
        other_membership = create(:earned_membership)
        get :show, params: {id: other_membership.to_param}, format: :json
        expect(response).to have_http_status(403)
      end

      it "Renders the current user's membership as json" do
        get :show, params: {id: membership.to_param}, format: :json

        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['earnedMembership']['id']).to eq(EarnedMembership.last.id.as_json)
      end
    end
  end

  it "Rejects unauthenticated requests" do
    other_membership = create(:earned_membership)
    get :show, params: {id: other_membership.to_param}, format: :json
    expect(response).to have_http_status(401)
  end
end