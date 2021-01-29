require 'rails_helper'

RSpec.describe Admin::RentalsController, type: :controller do

  def conv_to_ms(time)
    time.to_i * 1000
  end
  let(:member) { create(:member)}

  let(:valid_attributes) {
    { number: '1',
      member_id: member.id,
      expiration: conv_to_ms(Time.now + 1.month)
    }
  }

  let(:invalid_attributes) {
    {
      number: nil,
      expiration: conv_to_ms(Time.now)
    }
  }



  login_admin

  describe "GET index" do
    it "Renders the requested rentals as json" do
      rentals = FactoryBot.create_list(:rental, 3)
      get :index, format: :json
      expect(response).to have_http_status(200)
      parsed_response = JSON.parse(response.body)
      expect(parsed_response.count).to eq(Rental.count)
    end

    it "Can filter by member" do 
      member1 = create(:member)
      member2 = create(:member)
      rental = create(:rental, member: member1)
      rental2 = create(:rental, member: member2)

      get :index, params: { memberId: member2.id.to_s }, format: :json

      parsed_response = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "application/json"
      expect(parsed_response.first['id']).to eq(rental2.id.to_s)
    end
  end

  describe "POST #create" do
    context "with valid params" do
      it "creates a new rental" do
        expect {
          post :create, params: valid_attributes, format: :json
        }.to change(Rental, :count).by(1)
      end

      it "assigns a newly created rental as @rental" do
        post :create, params: valid_attributes, format: :json
        expect(assigns(:rental)).to be_a(Rental)
        expect(assigns(:rental)).to be_persisted
      end

      it "renders json of the created rental" do
        post :create, params: valid_attributes, format: :json

        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['id']).to eq(Rental.last.id.to_s)
      end
    end

    context "with invalid params" do
      it "raises validation error with invalid params" do
        post :create, params: invalid_attributes, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(422)
        expect(parsed_response['message']).to match(/number/i)
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
        put :update, params: new_attributes.merge({ id: rental.to_param }), format: :json
        rental.reload
        expect(rental.pretty_time).to eq(Time.at(new_attributes[:expiration]/1000))
      end

      it "renders json of the rental" do
        rental = Rental.create(valid_attributes)
        put :update, params: new_attributes.merge({ id: rental.to_param }), format: :json

        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['id']).to eq(rental.id.as_json)
      end

      it "Sends a slack notificsation" do
        rental = Rental.create(valid_attributes.merge({ expiration: ((Time.now + 1.month).strftime('%s').to_i * 1000)}))
        initial_expiration = rental.pretty_time
        expect(Rental).to receive(:find).and_return(rental) # Mock find to return the double
        expect(rental).to receive(:send_renewal_slack_message)
        put :update, params: {id: rental.to_param, renew: 10 }, format: :json
        expected_renewal = conv_to_ms(initial_expiration + 10.months)
        rental.reload
        expect(rental.expiration).to eq(expected_renewal)
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
