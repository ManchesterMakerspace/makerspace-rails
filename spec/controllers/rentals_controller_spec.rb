require 'rails_helper'

RSpec.describe RentalsController, type: :controller do

  let(:member) { create(:member)}

  let(:valid_attributes) {
    { number: '1',
      member_id: member.id,
      expiration: (Time.now + 1.month)
    }
  }

  before(:each) do
    @request.env["devise.mapping"] = Devise.mappings[:member]
    sign_in member
  end

  describe "GET #index" do
    it "assigns all rentals for current user as @rentals" do
      rental = Rental.create! valid_attributes
      get :index, params: {}
      expect(assigns(:rentals)).to eq([rental])
    end

    it "renders json of @rentals" do
      rental = Rental.create! valid_attributes
      get :index, params: {}

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['rentals'].first['id']).to eq(Rental.last.id.to_s)
    end
  end

  describe "GET #show" do
    it "assigns the requested rental as @rental" do
      rental = Rental.create! valid_attributes
      get :show, params: {id: rental.to_param}
      expect(assigns(:rental)).to eq(rental)
    end

    it "renders json of the created rental" do
      rental = Rental.create! valid_attributes
      get :show, params: {id: rental.to_param}

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['rental']['id']).to eq(Rental.last.id.to_s)
    end
  end
end
