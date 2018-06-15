require 'rails_helper'

RSpec.describe RegistrationsController, type: :controller do
  set_devise_mapping

  email = 'new_emails@email.com'
  let(:token) {SecureRandom.urlsafe_base64(nil, false)}
  let(:encrypted_token) {BCrypt::Password.create(token)}
  let(:token_model) { create(:registration_token, email: email)}

  let(:valid_attributes) {
    {
      firstname: 'New',
      lastname: 'Member',
      email: email,
      password: 'password',
      password_confirmation: 'password',
      token_id: token_model.id,
      token: token,
      signature: "data:image/png;base64," + Base64.encode64(File.new("#{Rails.root}/spec/support/makerspace.png").read)
    }
  }

  let(:invalid_attributes) {
    skip("Add a hash of attributes invalid for your model")
  }

  before(:all) do
    clear_email
  end

  before(:each) do
    token_model.update(token: encrypted_token)
  end

  describe "POST #create" do
    context "with valid params" do
      it "creates a new Member" do
        expect {
          post :create, params: {member: valid_attributes}, format: :json
        }.to change(Member, :count).by(1)
      end

      it "Uploads the member's signature" do
        post :create, params: {member: valid_attributes}, format: :json
        expect(assigns(:notifier)).to be_a(Slack::Notifier)
      end

      it "Adds user to gdrive" do
        post :create, params: {member: valid_attributes}, format: :json
        expect(assigns(:service)).to be_a(Google::Apis::DriveV3::DriveService)
      end

      it "assigns a newly created member as @member" do
        post :create, params: {member: valid_attributes}, format: :json
        expect(assigns(:member)).to be_a(Member)
        expect(assigns(:member)).to be_persisted
      end

      it "sends email notifying us of registered member" do
        expect(email_present(email)).to be_truthy
      end

      it "renders json of the created member" do
        post :create, params: {member: valid_attributes}, format: :json

        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['id']).to eq(Member.last.id.as_json)
      end
    end

    # context "with invalid params" do
    #   it "assigns a newly created but unsaved registration as @registration" do
    #     post :create, params: {registration: invalid_attributes}, session: valid_session
    #     expect(assigns(:registration)).to be_a_new(Registration)
    #   end
    #
    #   it "re-renders the 'new' template" do
    #     post :create, params: {registration: invalid_attributes}, session: valid_session
    #     expect(response).to render_template("new")
    #   end
    # end
  end
end
