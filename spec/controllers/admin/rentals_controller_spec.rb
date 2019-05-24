require 'rails_helper'

RSpec.describe Admin::RentalsController, type: :controller do

  let(:member) { create(:member)}

  let(:valid_attributes) {
    { number: '1',
      member_id: member.id,
      expiration: (Time.now + 1.month)
    }
  }

  let(:invalid_attributes) {
    {
      number: nil,
      expiration: Time.now
    }
  }

  login_admin

  describe "POST #create" do
    context "with valid params" do
      it "creates a new rental" do
        expect {
          post :create, params: {rental: valid_attributes}, format: :json
        }.to change(Rental, :count).by(1)
      end

      it "assigns a newly created rental as @rental" do
        post :create, params: {rental: valid_attributes}, format: :json
        expect(assigns(:rental)).to be_a(Rental)
        expect(assigns(:rental)).to be_persisted
      end

      it "renders json of the created rental" do
        post :create, params: {rental: valid_attributes}, format: :json

        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['rental']['id']).to eq(Rental.last.id.to_s)
      end
    end

    context "with invalid params" do
      it "raises validation error with invalid params" do
        post :create, params: {rental: invalid_attributes}, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(422)
        expect(parsed_response['message']).to match(/Number/)

        post :create, params: invalid_attributes, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(422)
        expect(parsed_response['message']).to match(/rental/)
      end
    end
  end

  describe "PUT #update" do
    context "with valid params" do
      let(:new_attributes) {
        {
          expiration: (Time.now + 2.months).to_i * 1000
        }
      }
      it "updates the requested rental" do
        rental = Rental.create(valid_attributes)
        put :update, params: {id: rental.to_param, rental: new_attributes}, format: :json
        rental.reload
        expect(rental.pretty_time).to eq(Time.at(new_attributes[:expiration]/1000))
      end

      it "renders json of the rental" do
        rental = Rental.create(valid_attributes)
        put :update, params: {id: rental.to_param, rental: new_attributes}, format: :json

        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['rental']['id']).to eq(rental.id.as_json)
      end
    end

     context "with invalid params" do
      it "raises not found if rental doens't exist" do
        put :update, params: {id: "foo" }, format: :json
        expect(response).to have_http_status(404)
      end
    end
  end
end
