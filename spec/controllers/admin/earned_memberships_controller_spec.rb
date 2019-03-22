require 'rails_helper'

RSpec.describe Admin::EarnedMembershipsController, type: :controller do
  describe "Authenticated" do
    let!(:membership) { create(:earned_membership) }
    let(:requirements) {
      FactoryBot.build_list(:requirement, 2)
    }
    login_admin
    describe "GET show" do
      it "Renders the requested membership as json" do
        get :show, params: {id: membership.to_param}, format: :json

        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['earnedMembership']['id']).to eq(EarnedMembership.last.id.as_json)
      end

      it "Raises 404 if no matching membership found" do
        get :show, params: {id: "foo"}, format: :json
        expect(response).to have_http_status(404)
      end
    end

    describe "GET index" do
      it "Renders the requested memberships as json" do
        memberships = FactoryBot.create_list(:earned_membership, 3)
        get :index, format: :json
        expect(response).to have_http_status(200)
        parsed_response = JSON.parse(response.body)
        expect(parsed_response["earnedMemberships"].count).to eq(EarnedMembership.count)
      end
    end

    describe "POST create" do
      it "Raises 422 if no requirements submitted with membership" do
        member = create(:member)
        membership_params = {
          member_id: member.id
        }
        post :create, params: { earned_membership: membership_params }, format: :json
        expect(response).to have_http_status(422)
      end

      it "Raises 422 if no member submitted with membership" do
        membership_params = {
          requirements: requirements
        }
        post :create, params: { earned_membership: membership_params }, format: :json
        expect(response).to have_http_status(422)
      end

      it "Renders newly created membership" do
        member = create(:member)
        membership_params = {
          member_id: member.id,
          requirements: requirements.map { |r| r.as_json }
        }
        post :create, params: { earned_membership: membership_params }, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response["earnedMembership"]["id"]).to eq(EarnedMembership.last.id.as_json)
      end
    end

    describe "PUT update" do
      it "Raises 404 if no matching membership found" do
        get :show, params: {id: "foo"}, format: :json
        expect(response).to have_http_status(404)
      end

      it "Renders updated membership" do
        member = create(:member)
        diff_member = create(:member)
        init_membership = create(:earned_membership, member: member)
        membership_params = {
          member_id: diff_member.id,
        }
        put :update, params: { id: init_membership.id, earned_membership: membership_params }, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response["earnedMembership"]["memberName"]).to eq(diff_member.fullname)
      end

      it "Deletes requirements missing from params" do
        member = create(:member)
        requirement_1 = create(:requirement)
        requirement_2 = create(:requirement)
        init_membership = create(:earned_membership_no_requirements, member: member, requirements: [requirement_1, requirement_2])
        expect(init_membership.requirements.count).to eq(2)
        update_params = {
          requirements: [requirement_1].as_json
        }
        put :update, params: { id: init_membership.id, earned_membership: update_params }, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response["earnedMembership"]["requirements"].count).to eq(1)
      end
    end
  end

  describe "Unauth" do
    describe "GET show" do
      it "Rejects unauthenticated requests" do
        get :show, params: { id: "foo" }, format: :json
        expect(response).to have_http_status(401)
      end

      it "Rejects non admin users" do
        member = create(:member)
        sign_in member
        get :show, params: { id: "foo" }, format: :json
        expect(response).to have_http_status(403)
      end
    end

    describe "GET index" do
      it "Rejects unauthenticated requests" do
        get :index, format: :json
        expect(response).to have_http_status(401)
      end

      it "Rejects non admin users" do
        member = create(:member)
        sign_in member
        get :index, format: :json
        expect(response).to have_http_status(403)
      end
    end

    describe "POST create" do
      it "Rejects unauthenticated requests" do
        post :create, format: :json
        expect(response).to have_http_status(401)
      end

      it "Rejects non admin users" do
        member = create(:member)
        sign_in member
        post :create, format: :json
        expect(response).to have_http_status(403)
      end
    end

    describe "PUT update" do
      it "Rejects unauthenticated requests" do
        put :update, params: { id: "foo" }, format: :json
        expect(response).to have_http_status(401)
      end

      it "Rejects non admin users" do
        member = create(:member)
        sign_in member
        put :update, params: { id: "foo" }, format: :json
        expect(response).to have_http_status(403)
      end
    end
  end
end