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

  # login_admin

  describe "POST #create" do
    context "with valid params" do
      it "creates a new Admin::Rental" do
        expect {
          post :create, params: {rental: valid_attributes}
        }.to change(Rental, :count).by(1)
      end

      it "assigns a newly created rental as @rental" do
        post :create, params: {rental: valid_attributes}
        expect(assigns(:rental)).to be_a(Rental)
        expect(assigns(:rental)).to be_persisted
      end

      it "renders json of the created rental" do
        post :create, params: {rental: valid_attributes}

        parsed_response = JSON.parse(response.body)
        expect(response.status).to eq(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['id']).to eq(Rental.last.id.to_s)
      end
    end

    context "with invalid params" do
      it "assigns a newly created but unsaved rental as @rental" do
        post :create, params: {rental: invalid_attributes}
        expect(assigns(:rental)).to be_a_new(Rental)
      end

      it "returns status 500" do
        post :create, params: {rental: invalid_attributes}
        expect(response.status).to eq(500)
        expect(response.content_type).to eq "application/json"
      end
    end
  end
end
