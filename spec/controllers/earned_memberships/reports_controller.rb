require 'rails_helper'

RSpec.describe EarnedMemberships::ReportsController, type: :controller do
  describe "Authenticated" do
    let!(:current_user) { create(:member) }
    let!(:membership) { create(:earned_membership_with_reports, member: current_user) }

    set_devise_mapping

    describe "GET index" do
      it "Raises 403 if current user isn't an earned member" do
        new_user = create(:member)
        get :index, format: :json
        expect(response).to have_http_status(401)
      end

      it "Renders the current user's reports as json" do
        sign_in current_user
        get :index, format: :json
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['reports'].first['id']).to eq(EarnedMembership::Report.last.id.as_json)
      end
    end

    describe "POST create" do
      let(:report_requirements) {
        [{
          requirement_id: membership.requirements.first.id,
          reported_count: 1
        }]
      }

      it "Raises 403 if current user isn't an earned member" do
        new_user = create(:member)
        sign_in new_user
        post :create, format: :json
        expect(response).to have_http_status(403)
      end

       it "Raises 403 if creating report for someone elses membership" do
        sign_in current_user
        other_membership = create(:earned_membership)
        report_params = {
          earned_membership_id: other_membership.id,
          report_requirements: report_requirements
        }
        post :create, params: { report: report_params }, format: :json
        expect(response).to have_http_status(403)
      end

      it "Raises 422 if no report requirements submitted with report" do
        sign_in current_user
        report_params = {
          earned_membership_id: membership.id,
        }
        post :create, params: { report: report_params }, format: :json
        expect(response).to have_http_status(422)
      end

      it "Raises 422 if no membership submitted with report" do
          sign_in current_user
          report_params = {
            report_requirements: report_requirements
          }
          post :create, params: { report: report_params }, format: :json
          expect(response).to have_http_status(422)
      end

      it "Creates and returns new report with valid params" do
        sign_in current_user
        report_params = {
          earned_membership_id: membership.id,
          report_requirements: report_requirements
        }
        post :create, params: { report: report_params }, format: :json
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['report']['id']).to eq(EarnedMembership::Report.last.id.as_json)
      end
    end
  end

  describe "Unauth" do
    describe "GET index" do
      it "Rejects unauthenticsated requests" do
        get :index, format: :json
        expect(response).to have_http_status(401)
      end
    end

    describe "POST create" do
      it "Rejects unauthenticsated requests" do
        post :create, format: :json
        expect(response).to have_http_status(401)
      end
    end
  end
end