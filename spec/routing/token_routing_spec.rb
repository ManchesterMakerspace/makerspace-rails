require "rails_helper"

RSpec.describe TokenController, type: :routing do
  describe "routing" do

    it "routes to #create" do
      expect(:post => "/api/token").to route_to("token#create", format: :json)
    end

    it "routes to #update via PUT" do
      expect(:post => "/api/token/1/567").to route_to("token#validate", :id => "1", :token => "567", format: :json)
    end

  end
end
