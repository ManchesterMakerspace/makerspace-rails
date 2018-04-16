require "rails_helper"

RSpec.describe MembersController, type: :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/api/members").to route_to("members#index", format: :json)
    end

    it "routes to #contract" do
      expect(:get => "/api/members/contract").to route_to("members#contract", format: :json)
    end

    it "does not route to #edit" do
      expect(:get => "/api/members/1/edit").not_to be_routable
    end

    it "does not route to #update via PUT" do
      expect(:put => "/api/members/1").not_to be_routable
    end

    it "does not route to #update via PATCH" do
      expect(:patch => "/api/members/1").not_to be_routable
    end

    it "does not route to #destroy" do
      expect(:delete => "/api/members/1").not_to be_routable
    end

    it "routes #create to registration" do
      expect(:post => "/api/members").to route_to("registrations#create", format: :json)
    end

    # Routes requiring auth can't be tested this way
    # it "routes to #show" do
    #   expect(:get => "/api/members/1").to route_to("members#show", :id => "1")
    # end
    #
    # it "routes #new to registration" do
    #   expect(:get => "/api/members/new").not_to be_routable
    # end

  end
end
