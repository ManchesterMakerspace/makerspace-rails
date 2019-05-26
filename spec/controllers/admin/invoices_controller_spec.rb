require 'rails_helper'

RSpec.describe Admin::InvoicesController, type: :controller do

  let(:member) { create(:member)}
  let(:rental) { create(:rental)}
  let(:invoice_option) { create(:invoice_option)}
  let(:rental_io) { create(:invoice_option, resource_class: "rental")}

  let(:valid_invoice_attributes) {
    { 
      description: "new invoice",
      amount: 65.0,
      resource_id: member.id,
      resource_class: "member",
      member_id: member.id,
      due_date: (Time.now + 1.month)
    }
  }


  let(:valid_invoice_option_attributes) {
    { 
      id: rental_io.id,
      resource_id: rental.id,
      member_id: member.id,
    }
  }

  login_admin

  describe "GET #index" do 
    context "with valid params" do 
      
    end
  end

  describe "POST #create" do
    context "with valid params" do
      it "creates a new invoice" do
        expect {
          post :create, params: {invoice: valid_invoice_attributes}, format: :json
        }.to change(Invoice, :count).by(1)

        expect {
          post :create, params: {invoice_option: valid_invoice_option_attributes}, format: :json
        }.to change(Invoice, :count).by(1)
      end

      it "renders json of the created invoice" do
        post :create, params: {invoice: valid_invoice_attributes}, format: :json

        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['invoice']['id']).to eq(Invoice.last.id.to_s)
      end
    end

    context "with invalid params" do
      it "raises validation error with invalid params" do
        post :create, params: {invoice: ({quantity: -1}).merge(valid_invoice_attributes)}, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(422)
        expect(parsed_response['message']).to match(/quantity/i)
      end

      it "validates invoice option id and member id exist and point to real documents" do 
        post :create, params: {invoice_option: { member_id: member.id, }}, format: :json
        expect(response).to have_http_status(422)
        expect(JSON.parse(response.body)['message']).to match(/ id/i)

        post :create, params: {invoice_option: { member_id: "foo", id: invoice_option.id }}, format: :json
        expect(response).to have_http_status(404)
        expect(JSON.parse(response.body)['message']).to match(/resource not found/i)

        post :create, params: {invoice_option: { id: invoice_option.id, }}, format: :json
        expect(response).to have_http_status(422)
        expect(JSON.parse(response.body)['message']).to match(/ member_id/i)

        post :create, params: {invoice_option: { id: "foo", member_id: member.id }}, format: :json
        expect(response).to have_http_status(404)
        expect(JSON.parse(response.body)['message']).to match(/resource not found/i)
      end
    end
  end

  describe "PUT #update" do
    context "with valid params" do
      let(:new_attributes) {
        {
          due_date: (Time.now + 2.months)
        }
      }
      let(:invoice) { create(:invoice, due_date: Time.now) }
      it "updates the requested invoice" do
        put :update, params: {id: invoice.to_param, invoice: new_attributes}, format: :json
        invoice.reload
        expect(invoice.due_date).to eq(Time.parse(new_attributes[:due_date].to_s))
      end

      it "renders json of the invoice" do
        put :update, params: {id: invoice.to_param, invoice: new_attributes}, format: :json

        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['invoice']['id']).to eq(invoice.id.as_json)
      end
    end

    context "with invalid params" do
      let(:invoice) { create(:invoice, due_date: Time.now) }
      it "raises not found if invoice doens't exist" do
        put :update, params: {id: "foo" }, format: :json
        expect(response).to have_http_status(404)
      end

      it "doesn't update invoice with invalid params" do 
        put :update, params: {id: invoice.to_param, invoice: {quantity: -1}}, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(422)
        expect(parsed_response['message']).to match(/quantity/i)
      end
    end
  end

  describe "DELETE #destroy" do
    let(:invoice) { create(:invoice) }
    context "with valid params" do 
      it "deletes the invoice" do 
        invoice
        expect {
          delete :destroy, params: {id: invoice.to_param}, format: :json
        }.to change(Invoice, :count).by(-1)

      end

      it "returns correct code" do 
        delete :destroy, params: {id: invoice.to_param}, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(204)
      end
    end 

    context "with invalid params" do
      it "raises not found if invoice doens't exist" do
        delete :destroy, params: {id: "foo" }, format: :json
        expect(response).to have_http_status(404)
      end
    end
  end
end
