require "rails_helper"

RSpec.describe Admin::MembersController, type: :routing do
  describe "routing" do

    # it "routes to #create" do
    #   expect(:post => "/api/admin/members").to route_to("admin/members#create")
    # end

    # it "routes to #update via PUT" do
    #   expect(:put => "/api/admin/members/1").to route_to("admin/members#update", :id => "1")
    # end

    it "does not route to #index" do
      expect(:get => "/api/admin/members").not_to be_routable
    end

    it "does not route to #new" do
      expect(:get => "/api/admin/members/new").not_to be_routable
    end

    it "does not route to #show" do
      expect(:get => "/api/admin/members/1").not_to be_routable
    end

    it "does not route to #edit" do
      expect(:get => "/api/admin/members/1/edit").not_to be_routable
    end

    # it "does not route to #update via PATCH" do
    #   expect(:patch => "/api/admin/members/1").not_to be_routable
    # end

    it "does not route to #destroy" do
      expect(:delete => "/api/admin/members/1").not_to be_routable
    end

  end
end
