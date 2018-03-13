require "rails_helper"

RSpec.describe PaypalController, type: :routing do
  describe "routing" do

    it "routes to #notify" do
      expect(:post => "/ipnlistener").to route_to("paypal#notify")
    end
  end
end
