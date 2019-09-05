require 'rails_helper'

RSpec.describe Admin::CardsController, type: :controller do

  let(:member) { create(:member) }
  let(:other_member) { create(:member) }

  let(:valid_attributes) {
    {
      member_id: member.id,
      uid: 'A146HG'
    }
  }

  let(:duplicate_member_card) {
    {
      member_id: member.id,
      uid: 'KJK08'
    }
  }

  let(:second_member_card) {
    {
      member_id: member.id,
      uid: 'PID08'
    }
  }

  let(:different_member_cards) {
    {
      member_id: other_member.id,
      uid: 'BBH81'
    }
  }

  describe "Authenticated admin" do
    login_admin
    describe "GET #index" do
      it "retrieves all cards of requested member" do
        card = Card.create! valid_attributes
        also_member_card = Card.create! duplicate_member_card
        diff_member_card = Card.create! different_member_cards

        get :index, params: { memberId: card.member.id.as_json }
        expect(assigns(:cards).to_a).to include(card, also_member_card)
        expect(assigns(:cards).to_a).not_to include(diff_member_card)
      end
    end

    describe "GET #new" do
      it "retrieves the last rejection card not assigned to a member" do
        get :new, params: {}
        expect(assigns(:card)).to be_a_new(Card)
      end
    end

    describe "POST #create" do
      context "with valid params" do
        it "creates a new Card if member doesn't have one" do
          expect {
            post :create, params: {"card" => valid_attributes}, format: :json
          }.to change(Card, :count).by(1)
        end

        it "renders json of the created card" do
          post :create, params: {"card" => valid_attributes}, format: :json

          parsed_response = JSON.parse(response.body)
          expect(response).to have_http_status(200)
          expect(response.content_type).to eq "application/json"
          expect(parsed_response['card']['id']).to eq(Card.last.id.as_json)
        end

        it "invalidates existing cards if member already has one" do
          first_card = Card.create! valid_attributes
          second_card = Card.create! second_member_card
          expect {
            post :create, params: {"card" => duplicate_member_card}, format: :json
          }.to change(Card, :count)
          first_card.reload
          second_card.reload
          expect(first_card.validity).to eq("lost")
          expect(second_card.validity).to eq("lost")
        end

        it "duplicate cards for a members returns status 200" do
          card = Card.create! valid_attributes
          post :create, params: {"card" => duplicate_member_card}, format: :json
          card.reload

          parsed_response = JSON.parse(response.body)
          expect(response).to have_http_status(200)
          expect(response.content_type).to eq "application/json"
          expect(parsed_response['card']['id']).to eq(Card.last.id.as_json)
          expect(Card.last.id.as_json).not_to eq(card.id)
        end
      end

      context "with invalid params" do
        let(:missing_uid_attributes) {
          {
            member_id: member.id
          }
        }
        let(:missing_member_attributes) {
          {
            uid: '12345'
          }
        }
        it "does not create new card without uid" do
          expect {
            post :create, params: {"card" => missing_uid_attributes}, format: :json
          }.not_to change(Card, :count)
        end

        it "does not create new card without member" do
          expect {
            post :create, params: {"card" => missing_member_attributes}, format: :json
          }.not_to change(Card, :count)
        end

        it "invalid cards return status 500" do
          post :create, params: {"card" => missing_uid_attributes}, format: :json
          parsed_response = JSON.parse(response.body)
          expect(response).to have_http_status(422)
          expect(parsed_response['message']).to match(/Uid/)

          post :create, params: {"card" => missing_member_attributes}, format: :json
          expect(response).to have_http_status(422)
        end
      end
    end

    describe "PUT #update" do
      context "with valid params" do

        let(:valid_lost_attributes) {
          {
            member_id: member.id,
            uid: 'A146HG',
            card_location: 'lost'
          }
        }

        let(:valid_stolen_attributes) {
          {
            member_id: member.id,
            uid: 'A146HG',
            card_location: 'stolen'
          }
        }

        it "updates the requested card to lost" do
          card = Card.create! valid_attributes
          put :update, params: {id: card.to_param, card: valid_lost_attributes}, format: :json
          card.reload
          expect(card.validity).to eq('lost')
        end

        it "updates the requested card to stolen" do
          card = Card.create! valid_attributes
          put :update, params: {id: card.to_param, card: valid_stolen_attributes}, format: :json
          card.reload
          expect(card.validity).to eq('stolen')
        end

        it "renders json of the updated card" do
          card = Card.create! valid_attributes
          put :update, params: {id: card.to_param, card: valid_stolen_attributes}, format: :json
          parsed_response = JSON.parse(response.body)
          expect(response).to have_http_status(200)
          expect(response.content_type).to eq "application/json"
          expect(parsed_response['card']['id']).to eq(Card.last.id.to_s)
        end
      end
    end
  end

  describe "Unauthorized" do
    describe "GET #index" do
      it "Returns 401" do
        card = Card.create! valid_attributes
        get :index, params: {id: card.member.id}, format: :json
        expect(response).to have_http_status(401)
      end
    end
    describe "GET #new" do
      it "Returns 401" do
        get :new, params: {}, format: :json
        expect(response).to have_http_status(401)
      end
    end
    describe "POST #create" do
      it "Returns 401" do
        post :create, params: {"card" => valid_attributes}, format: :json
        expect(response).to have_http_status(401)
      end
    end
    describe "PUT #update" do
      it "Returns 401" do
        card = Card.create! valid_attributes
        put :update, params: {id: card.to_param, card: valid_attributes}, format: :json
        expect(response).to have_http_status(401)
      end
    end
  end

  describe "Basic User" do
    login_user
    describe "GET #index" do
      it "Returns 401" do
        card = Card.create! valid_attributes
        get :index, params: {id: card.member.id}, format: :json
        expect(response).to have_http_status(403)
      end
    end
    describe "GET #new" do
      it "Returns 401" do
        get :new, params: {}, format: :json
        expect(response).to have_http_status(403)
      end
    end
    describe "POST #create" do
      it "Returns 401" do
        post :create, params: {"card" => valid_attributes}, format: :json
        expect(response).to have_http_status(403)
      end
    end
    describe "PUT #update" do
      it "Returns 401" do
        card = Card.create! valid_attributes
        put :update, params: {id: card.to_param, card: valid_attributes}, format: :json
        expect(response).to have_http_status(403)
      end
    end
  end
end
