require 'spec_helper'

describe PayPal::SDK::Core::API::REST do

  module PayPalRest
    class API < PayPal::SDK::Core::API::REST
    end
  end

  def create_api(*args)
    api = PayPalRest::API.new(*args)
    @log_file ||= File.open("spec/log/rest_http.log", "w")
    api.http.set_debug_output(@log_file)
    api
  end

  before :all do
    @api = create_api("v1/payments/", :with_authentication)
    @vault_api = create_api("v1/vault/", :with_authentication)
  end

  describe "Configuration" do
    it "create api with prefix" do
      api = create_api("v1/payments")
      api.uri.path.should eql "/v1/payments"
    end

    it "service endpoint for sandbox" do
      api = create_api
      api.service_endpoint.should eql "https://api.sandbox.paypal.com"
      api.token_endpoint.should   eql "https://api.sandbox.paypal.com"
      api = create_api( :mode => "sandbox" )
      api.service_endpoint.should eql "https://api.sandbox.paypal.com"
      api.token_endpoint.should   eql "https://api.sandbox.paypal.com"
      api = create_api( :mode => :sandbox )
      api.service_endpoint.should eql "https://api.sandbox.paypal.com"
      api.token_endpoint.should   eql "https://api.sandbox.paypal.com"
      api = create_api( :mode => "invalid" )
      api.service_endpoint.should eql "https://api.sandbox.paypal.com"
      api.token_endpoint.should   eql "https://api.sandbox.paypal.com"
      api = create_api( :mode => nil )
      api.service_endpoint.should eql "https://api.sandbox.paypal.com"
      api.token_endpoint.should   eql "https://api.sandbox.paypal.com"
    end

    it "service endpoint for live" do
      api = create_api( :mode => "live" )
      api.service_endpoint.should eql "https://api.paypal.com"
      api.token_endpoint.should   eql "https://api.paypal.com"
      api = create_api( :mode => :live )
      api.service_endpoint.should eql "https://api.paypal.com"
      api.token_endpoint.should   eql "https://api.paypal.com"
    end

    it "override service endpoint" do
      api = create_api( :rest_endpoint => "https://testing.api.paypal.com" )
      api.service_endpoint.should eql "https://testing.api.paypal.com"
      api.token_endpoint.should   eql "https://testing.api.paypal.com"
      api = create_api( :endpoint => "https://testing.api.paypal.com" )
      api.service_endpoint.should eql "https://testing.api.paypal.com"
      api.token_endpoint.should   eql "https://testing.api.paypal.com"
    end

    it "override token endpoint" do
      api = create_api( :rest_token_endpoint => "https://testing.api.paypal.com" )
      api.service_endpoint.should eql "https://api.sandbox.paypal.com"
      api.token_endpoint.should   eql "https://testing.api.paypal.com"
    end
  end

  describe "Validation" do
    it "Invalid client_id and client_secret" do
      api = create_api(:with_authentication, :client_id => "XYZ", :client_secret => "ABC")
      lambda {
        api.token
      }.should raise_error PayPal::SDK::Core::Exceptions::UnauthorizedAccess
    end

    xit "Should handle expired token" do
      old_token = @api.token
      @api.token_hash[:expires_in] = 0
      @api.token.should_not eql old_token
    end

    it "Get token" do
      @api.token.should_not be_nil
    end
  end

  describe "Success request" do

    it "Create Payment" do
      response = @api.post("payment", {
        "intent" => "sale",
        "payer" => {
          "payment_method" => "credit_card",
          "funding_instruments" => [{
            "credit_card" => {
              "type" => "visa",
              "number" => "4417119669820331",
              "expire_month" => "11", "expire_year" => "2018",
              "first_name" => "Joe", "last_name" => "Shopper" }}]},
        "transactions" => [{
          "amount" => {
            "total" => "7.47",
            "currency" => "USD" }}]})
      response["error"].should be_nil
    end

    it "List Payments" do
      response = @api.get("payment", { "count" => 10 })
      response["error"].should be_nil
      response["count"].should_not be_nil
    end

    it "Execute Payment"

    it "Create FundingInstrument" do
      new_funding_instrument = @vault_api.post("credit-card", {
        "type" =>  "visa",
        "number" =>  "4111111111111111",
        "expire_month" =>  "11", "expire_year" =>  "2018",
        "cvv2" =>  "874",
        "first_name" =>  "Joe", "last_name" =>  "Shopper" })
      new_funding_instrument["error"].should  be_nil
      new_funding_instrument["id"].should_not be_nil

      funding_instrument = @vault_api.get("credit-card/#{new_funding_instrument["id"]}")
      funding_instrument["error"].should be_nil
      funding_instrument["id"].should eql new_funding_instrument["id"]
    end

  end

  describe "Failure request" do
    it "Invalid Resource ID" do
      lambda {
        response = @api.get("payment/PAY-1234")
      }.should raise_error PayPal::SDK::Core::Exceptions::ResourceNotFound
    end

    xit "Invalid parameters" do
      response = @api.post("payment")
      response["error"]["name"].should eql "VALIDATION_ERROR"
    end
  end
end
