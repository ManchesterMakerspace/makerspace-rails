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
      rental = Rental.create(valid_attributes)
      get :index, params: {}
      expect(assigns(:rentals)).to eq([rental])
    end

    it "renders json of @rentals" do
      rental = Rental.create(valid_attributes)
      get :index, params: {}

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response.first['id']).to eq(Rental.last.id.to_s)
    end
  end

  describe "GET #show" do
    it "assigns the requested rental as @rental" do
      rental = Rental.create(valid_attributes)
      get :show, params: {id: rental.to_param}
      expect(assigns(:rental)).to eq(rental)
    end

    it "renders json of the created rental" do
      rental = Rental.create(valid_attributes)
      get :show, params: {id: rental.to_param}

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['id']).to eq(Rental.last.id.to_s)
    end
  end

  describe "PUT #update" do
    let!(:current_user) { create(:member) }
    let(:rental) { create(:rental, member: current_user) }
    before(:each) do
      sign_in current_user
    end

    it "renders json of the updated rental" do
      put :update, params: { id: rental.id, rental: { signature: "foo,bar" } }, format: :json
      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      parsed_response = JSON.parse(response.body)
      expect(parsed_response['id']).to eq(rental.id.as_json)
      expect(parsed_response['contractOnFile']).to eq(true)
    end

    it "raises forbidden if not updating own rental" do
      member = create(:member)
      rental = create(:rental, member: member)
      put :update, params: { id: rental.id, rental: { signature: "foo" } }, format: :json
      expect(response).to have_http_status(403)
    end

    it "raises not found if rental doens't exist" do
      put :update, params: { id: "foo", rental: { signature: "foo" } }, format: :json
      expect(response).to have_http_status(404)
    end

    it "raises missing parameter if signature not provided" do 
      put :update, params: { id: rental.id, rental: {} }, format: :json
      expect(response).to have_http_status(422)
    end
  end
end
