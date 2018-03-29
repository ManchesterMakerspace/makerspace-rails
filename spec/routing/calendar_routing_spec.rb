require "rails_helper"

RSpec.describe CalendarController, type: :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/api/calendar").to route_to("calendar#index", format: :json)
    end

    it "routes to #update via PUT" do
      expect(:put => "/api/calendar/1").to route_to("calendar#update", :id => "1", format: :json)
    end

    it "routes to #update via PATCH" do
      expect(:patch => "/api/calendar/1").to route_to("calendar#update", :id => "1", format: :json)
    end



    it "does not route to #new" do
      expect(:get => "/api/calendar/new").not_to be_routable
    end

    it "does not route to #show" do
      expect(:get => "/api/calendar/1").not_to be_routable
    end

    it "does not route to #edit" do
      expect(:get => "/api/calendar/1/edit").not_to be_routable
    end

    it "does not route to #create" do
      expect(:post => "/api/calendar").not_to be_routable
    end

    it "does not route to #destroy" do
      expect(:delete => "/api/calendar/1").not_to be_routable
    end

  end
end
