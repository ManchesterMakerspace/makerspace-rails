require "rails_helper"

RSpec.describe Admin::RentalsController, type: :routing do
  describe "routing" do

    it "does not route to #index" do
      expect(:get => "/admin/rentals").not_to be_routable
    end

    it "does not route to #new" do
      expect(:get => "/admin/rentals/new").not_to be_routable
    end

    it "does not route to #show" do
      expect(:get => "/admin/rentals/1").not_to be_routable
    end

    it "does not route to #edit" do
      expect(:get => "/admin/rentals/1/edit").not_to be_routable
    end

    # it "routes to #create" do
    #   expect(:post => "/admin/rentals").to route_to("admin/rentals#create")
    # end
    #
    # it "routes to #update via PUT" do
    #   expect(:put => "/admin/rentals/1").to route_to("admin/rentals#update", :id => "1")
    # end
    #
    # it "routes to #update via PATCH" do
    #   expect(:patch => "/admin/rentals/1").to route_to("admin/rentals#update", :id => "1")
    # end
    #
    # it "routes to #destroy" do
    #   expect(:delete => "/admin/rentals/1").to route_to("admin/rentals#destroy", :id => "1")
    # end

  end
end
