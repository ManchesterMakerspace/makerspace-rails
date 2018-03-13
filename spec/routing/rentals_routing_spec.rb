require "rails_helper"

RSpec.describe RentalsController, type: :routing do
  describe "routing" do

    it "routes to #index" do
      expect(:get => "/api/rentals").to route_to("rentals#index")
    end

    it "does not route to #edit" do
      expect(:get => "/api/rentals/1/edit").not_to be_routable
    end

    it "does not route to #create" do
      expect(:post => "/api/rentals").not_to be_routable
    end

    it "does not route to #update via PUT" do
      expect(:put => "/api/rentals/1").not_to be_routable
    end

    it "does not route to #update via PATCH" do
      expect(:patch => "/api/rentals/1").not_to be_routable
    end

    it "does not route to #destroy" do
      expect(:delete => "/api/rentals/1").not_to be_routable
    end

    # Routes requiring auth can't be tested this way
    # it "does not route to #new" do
    #   expect(:get => "/api/rentals/new").not_to be_routable
    # end
    #
    # it "does not route to #show" do
    #   expect(:get => "/api/rentals/1").not_to be_routable
    # end
  end
end
