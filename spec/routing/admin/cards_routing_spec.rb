require "rails_helper"

RSpec.describe Admin::CardsController, type: :routing do
  describe "routing" do

    it "does not route to #index" do
      expect(:get => "/api/admin/cards").not_to be_routable
    end
    # it "routes to #new" do
    #   expect(:get => "/admin/cards/new").to route_to("admin/cards#new")
    # end
    #
    # it "routes to #show" do
    #   expect(:get => "/admin/cards/1").to route_to("admin/cards#show", :id => "1")
    # end

    it "does not route to #edit" do
      expect(:get => "/api/admin/cards/1/edit").not_to be_routable
    end

    # it "routes to #create" do
    #   expect(:post => "/admin/cards").to route_to("admin/cards#create")
    # end
    #
    # it "routes to #update via PUT" do
    #   expect(:put => "/admin/cards/1").to route_to("admin/cards#update", :id => "1")
    # end
    #
    # it "routes to #update via PATCH" do
    #   expect(:patch => "/admin/cards/1").to route_to("admin/cards#update", :id => "1")
    # end

    it "does not route to #destroy" do
      expect(:delete => "/api/admin/cards/1").not_to be_routable
    end

  end
end
