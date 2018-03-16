require 'rails_helper'

RSpec.describe TokenController, type: :controller do

  let(:valid_attributes) {
    {
      email: 'differentEmail@test.com'
    }
  }

  let(:invalid_attributes) {
    {
      email: nil
    }
  }

  before(:each) do
    clear_email
  end

  describe "POST #validate" do
    context "with valid params" do
      it "assigns the requested token as @token" do
        token = create(:registration_token)
        token_email = get_registration_token(token.email)
        expect(token.id.as_json).to eq(token_email[:id])

        post :validate, params: {id: token_email[:id], token: token_email[:token]}, format: :json
        expect(assigns(:token)).to eq(token)
      end

      it "renders json of the correct token" do
        token = create(:registration_token)
        token_email = get_registration_token(token.email)
        expect(token.id.as_json).to eq(token_email[:id])

        post :validate, params: {id: token_email[:id], token: token_email[:token]}, format: :json
        expect(assigns(:token)).to eq(token)

        expect(response.status).to eq(200)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['email']).to eq(token.email)
      end
    end

    context "with invalid params" do
      it "Returns 'Email already taken' with status 400 if Member exists with email" do
        member = create(:member)
        token = create(:registration_token)
        token_email = get_registration_token(token.email)
        post :validate, params: {id: token_email[:id], token: token_email[:token], email: member.email}, format: :json

        expect(response.status).to eq(400)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['msg']).to eq("Email already taken")
      end

      it "Returns 400 with validation error if no token found" do
        post :validate, params: {id: 666, token: 0}, format: :json

        expect(response.status).to eq(400)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['msg']).to eq("Invalid registration link")
      end

      it "Returns 400 with validation error if it doesn't pass validation" do
        token = create(:registration_token)
        post :validate, params: {id: token.id, token: 'wrong'}, format: :json

        expect(response.status).to eq(400)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['msg']).to eq("Invalid registration link")
      end

      it "Returns 400 with validation error if token was already used" do
        token = create(:registration_token, { used: true} )
        token_email = get_registration_token(token.email)
        expect(token.id.as_json).to eq(token_email[:id])

        post :validate, params: {id: token_email[:id], token: token_email[:token]}, format: :json

        expect(response.status).to eq(400)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['msg']).to eq("Registeration link already used. Please login")
      end
    end
  end

  describe "POST #create" do
    context "with valid params" do
      it "sends an email with the token details" do
        post :create, params: valid_attributes, format: :json
        expect(File.readable?(Rails.root.join('tmp/mail'))).to be_truthy
        token_details = get_registration_token(valid_attributes[:email])
        expect(token_details[:id]).to be_truthy
        expect(token_details[:token]).to be_truthy
      end

      it "creates a new RegistrationToken" do
        expect {
          post :create, params: valid_attributes, format: :json
        }.to change(RegistrationToken, :count).by(1)
      end

      it "renders json w/ status 200" do
        post :create, params: valid_attributes, format: :json
        expect(response.status).to eq(200)
        expect(response.content_type).to eq "application/json"
      end
    end

    context "with invalid params" do
      it "Returns 'Email already taken' with status 400 if Member exists with email" do
        member = create(:member)
        post :create, params: {email: member.email}, format: :json

        expect(response.status).to eq(400)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['msg']).to eq("Email already taken")
      end

      it "Returns 400 with validation error if missing email" do
        post :create, params: {email: nil}, format: :json

        expect(response.status).to eq(400)
        expect(response.content_type).to eq "application/json"
        parsed_response = JSON.parse(response.body)
        expect(parsed_response['msg']['email']).to eq(["can't be blank"])
      end
    end
  end

end
