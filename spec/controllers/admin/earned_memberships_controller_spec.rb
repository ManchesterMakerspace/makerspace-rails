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
        expect(parsed_response['id']).to eq(EarnedMembership.last.id.as_json)
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
        expect(parsed_response.count).to eq(EarnedMembership.count)
      end
    end

    describe "POST create" do
      it "Raises 422 if no requirements submitted with membership" do
        member = create(:member)
        membership_params = {
          member_id: member.id
        }
        post :create, params: membership_params, format: :json
        expect(response).to have_http_status(422)
      end

      it "Raises 422 if no member submitted with membership" do
        membership_params = {
          requirements: requirements
        }
        post :create, params: membership_params, format: :json
        expect(response).to have_http_status(422)
      end

      it "Renders newly created membership" do
        member = create(:member)
        membership_params = {
          member_id: member.id,
          requirements: requirements.map { |r| r.as_json }
        }
        post :create, params: membership_params, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response["id"]).to eq(EarnedMembership.last.id.as_json)
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
        requirement_1 = create(:requirement, name: "foo")
        requirement_2 = create(:requirement, name: "bar")

        init_membership = create(:earned_membership_no_requirements, member: member, requirements: [requirement_1, requirement_2])
        requirement_1.name = "fizz"
        requirement_2.name = "buzz"

        requirements_json = ActiveModelSerializers::SerializableResource.new(
          [requirement_1, requirement_2], 
          each_serializer: EarnedMembership::RequirementSerializer,
          adapter: :attributes
        ).as_json

        membership_params = {
          requirements: requirements_json,
          id: init_membership.id
        }
        put :update, params: membership_params, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response["requirements"].length).to eq(2)
        expect(parsed_response["requirements"].first["name"]).to eq("fizz")
        expect(parsed_response["requirements"].last["name"]).to eq("buzz")
      end

      it "Adds new requirements" do 
        member = create(:member)
        diff_member = create(:member)
        requirement_2 = create(:requirement, name: "bar")
        requirement_1 = build(:requirement, name: "foo", id: nil)

        init_membership = create(:earned_membership_no_requirements, member: member, requirements: [requirement_2])
        requirements_json = ActiveModelSerializers::SerializableResource.new(
          [requirement_1, requirement_2], 
          each_serializer: EarnedMembership::RequirementSerializer,
          adapter: :attributes
        ).as_json

        membership_params = {
          requirements: requirements_json,
          id: init_membership.id
        }
        put :update, params: membership_params, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response["requirements"].length).to eq(2)
        expect(parsed_response["requirements"].first["name"]).to eq("bar")
        expect(parsed_response["requirements"].last["name"]).to eq("foo")
      end

      it "Deletes requirements missing from params" do
        member = create(:member)
        diff_member = create(:member)
        requirement_1 = create(:requirement, name: "foo")
        requirement_2 = create(:requirement, name: "bar")
        requirement_3 = create(:requirement, name: "fizz")
        requirement_4 = create(:requirement, name: "buzz")

        init_membership = create(:earned_membership_no_requirements, member: member, requirements: [
          requirement_1,
          requirement_2,
          requirement_3,
          requirement_4,
        ])
        requirements_json = ActiveModelSerializers::SerializableResource.new(
          [requirement_1, requirement_2], 
          each_serializer: EarnedMembership::RequirementSerializer,
          adapter: :attributes
        ).as_json

        membership_params = {
          requirements: requirements_json,
          id: init_membership.id
        }
        put :update, params: membership_params, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response["requirements"].length).to eq(2)
        expect(parsed_response["requirements"].first["name"]).to eq("foo")
        expect(parsed_response["requirements"].last["name"]).to eq("bar")
      end

      it "Raises a 404 error if a requirement does not exist" do 
        requirement_2 = build(:requirement, name: "bar")
        init_membership = create(:earned_membership)
        requirements_json = ActiveModelSerializers::SerializableResource.new(
          [requirement_2], 
          each_serializer: EarnedMembership::RequirementSerializer,
          adapter: :attributes
        ).as_json
        membership_params = {
          requirements: requirements_json,
          id: init_membership.id
        }
        put :update, params: membership_params, format: :json
        expect(response).to have_http_status(404)
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