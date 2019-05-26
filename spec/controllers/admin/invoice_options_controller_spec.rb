require 'rails_helper'

RSpec.describe Admin::InvoiceOptionsController, type: :controller do
  let(:valid_attributes) {
    {
      description: "foo",
      name: "Bar",
      resource_class: "member",
      amount: 60,
      quantity: 1,
      disabled: false
    }
  }
  let(:invoice_option) { create(:invoice_option, quantity: 1) }
  login_admin

  describe "POST #create" do 
    context "with valid params" do 
      it "creates a new invoice option" do 
        expect {
          post :create, params: { invoice_option: valid_attributes}, format: :json
        }.to change(InvoiceOption, :count).by(1)
      end
     
      it "renders json of the created invoice option" do 
        post :create, params: { invoice_option: valid_attributes}, format: :json

        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['invoiceOption']['id']).to eq(InvoiceOption.last.id.to_s)
      end
    end

    context "with invalid params" do 
      it "raises validation error with invalid params" do 
        post :create, params: { invoice_option: { quantity: -1 }}, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(422)
        expect(parsed_response['message']).to match(/quantity/i)
      end
    end
  end

  describe "PUT #update" do 
    context "with valid params" do 
      let(:new_attributes) { {quantity: 5} }
      it "updates the requested invoice option" do
        put :update, params: {id: invoice_option.to_param, invoice_option: new_attributes}, format: :json
        invoice_option.reload
        expect(invoice_option.quantity).to eq(new_attributes[:quantity])
      end

      it "renders json of the invoice_option" do
        put :update, params: {id: invoice_option.to_param, invoice_option: new_attributes}, format: :json

        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(200)
        expect(response.content_type).to eq "application/json"
        expect(parsed_response['invoiceOption']['id']).to eq(invoice_option.id.to_s)
      end
    end

    context "with invalid params" do 
      it "raises not found if invoice option doens't exist" do
        put :update, params: {id: "foo" }, format: :json
        expect(response).to have_http_status(404)
      end

      it "doesn't update invoice option with invalid params" do 
        put :update, params: {id: invoice_option.to_param, invoice_option: {quantity: -1}}, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(422)
        expect(parsed_response['message']).to match(/quantity/i)
      end
    end
  end

  describe "DELETE #destroy" do 
    context "with valid params" do 
      it "deletes the invoice option" do 
        invoice_option # Invoke here to create the IO
        expect {
          delete :destroy, params: {id: invoice_option.to_param}, format: :json
        }.to change(InvoiceOption, :count).by(-1)
      end

      it "returns correct code" do 
        delete :destroy, params: {id: invoice_option.to_param}, format: :json
        parsed_response = JSON.parse(response.body)
        expect(response).to have_http_status(204)
      end
    end 

    context "with invalid params" do
      it "raises not found if invoice option doens't exist" do
        delete :destroy, params: {id: "foo" }, format: :json
        expect(response).to have_http_status(404)
      end
    end
  end
end
