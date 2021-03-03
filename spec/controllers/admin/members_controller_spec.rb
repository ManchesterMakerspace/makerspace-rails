require 'rails_helper'

RSpec.describe Admin::MembersController, type: :controller do

  let(:valid_attributes) {
    {
      firstname: 'Test',
      lastname: 'Tester',
      email: 'test@test.com',
    }
  }

  def get_fullname(member)
    return member[:firstname] + " " + member[:lastname]
  end

  # Need this because we store things in milliseconds instead of ruby seconds
  def conv_to_ms(time)
    time.to_i * 1000
  end

  describe "Authenticated admin" do
    login_admin

    describe "POST #create" do
      context "with valid params" do
        it "creates a new member" do
          expect {
            post :create, params: valid_attributes, format: :json
          }.to change(Member, :count).by(1)
        end

        it "assigns a newly created member as @member" do
          post :create, params: valid_attributes, format: :json
          one_month_later_after = Time.now + 1.month;

          expect(assigns(:member)).to be_a(Member)
          expect(assigns(:member)).to be_persisted
          expect(assigns[:member].firstname).to eq(valid_attributes[:firstname])
        end

        it "renders json of the created member" do
          post :create, params: valid_attributes, format: :json

          parsed_response = JSON.parse(response.body)
          expect(response).to have_http_status(200)
          expect(response.content_type).to eq "application/json"
          expect(parsed_response['id']).to eq(Member.last.id.as_json)
        end

        it "sends an email for the created member to reset password" do
          expect(MemberMailer).to receive(:welcome_email_manual_register).and_call_original
          post :create, params: valid_attributes, format: :json
        end
      end

      context "with invalid params" do
        missing_member_prop = {
          firstname: 'Test',
          email: 'test@test.com',
        }

        it "raises validation error with invalid params" do
          post :create, params: missing_member_prop, format: :json

          parsed_response = JSON.parse(response.body)
          expect(response).to have_http_status(422)
          expect(parsed_response['message']).to match(/lastname/i)
        end
      end
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
        create_attr = {
            email: 'new_email@test.com',
            firstname: 'Change',
            lastname: 'Name',
        }

        it "updates the requested member" do
          member = Member.create create_attr
          one_month_later = Time.now + 1.month;
          put :update, params: new_attributes.merge({ id: member.to_param }), format: :json
          one_month_later_after = Time.now + 1.month;

          member.reload
          expect(member.email).to eq(new_attributes[:email])
          expect(member.fullname).to eq(get_fullname(new_attributes))
          expect(member.expirationTime).to be >= conv_to_ms(one_month_later)
          expect(member.expirationTime).to be <= conv_to_ms(one_month_later_after)
        end

        it "renders json of the member" do
          member = Member.create valid_attributes
          put :update, params: new_attributes.merge({ id: member.to_param }), format: :json

          parsed_response = JSON.parse(response.body)
          expect(response).to have_http_status(200)
          expect(response.content_type).to eq "application/json"
          expect(parsed_response['id']).to eq(member.id.as_json)
        end

        it "Sends a slack notification" do
          member = Member.create valid_attributes.merge({ expirationTime: ((Time.now + 1.month).strftime('%s').to_i * 1000)})
          initial_expiration = member.pretty_time
          expect(Member).to receive(:find).and_return(member) # Mock find to return the double
          expect(member).to receive(:send_renewal_slack_message)
          put :update, params: {id: member.to_param, renew: 10 }, format: :json
          expected_renewal = conv_to_ms(initial_expiration + 10.months)
          member.reload
          expect(member.expirationTime).to eq(expected_renewal)
        end
      end

      context "with invalid params" do
        invalid_params = {
          firstname: 'Test',
          email: 'test@test.com',
          role: "foo"
        }

        it "raises validation error with invalid params" do
          member = Member.create valid_attributes
          put :update, params: invalid_params.merge({ id: member.to_param }), format: :json

          parsed_response = JSON.parse(response.body)
          expect(response).to have_http_status(422)
          expect(parsed_response['message']).to match(/Role/)
        end

        it "raises not found if member doens't exist" do
          put :update, params: {id: "foo" }, format: :json
          parsed_response = JSON.parse(response.body)
          expect(response).to have_http_status(404)
        end
      end
    end
  end
end
