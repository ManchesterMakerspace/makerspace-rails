require 'rails_helper'

RSpec.describe CalendarController, type: :controller do

  describe "GET #index" do
    it "assigns all calendar events as @open" do
      get :index
      expect(assigns(:open)).to be_instance_of(Google::Apis::CalendarV3::Events)
      expect(assigns(:open).items.size).to eq(20)
    end
  end


  describe "PUT #update" do
    context "with valid params" do
      let(:member) { create(:member) }
      before(:each) do
        get :index
        @event = assigns(:open).items.first
      end

      it "Adds attendee to event" do
        put :update, params: {id: @event.id, attendee: {email: member.email}}, format: :json
        expect(assigns(:event)).to be_instance_of(Google::Apis::CalendarV3::Event)
        attendee_emails = assigns(:event).attendees.map { |a| a.email }
        expect(attendee_emails).to include(member.email)
      end
    end
  end
end
