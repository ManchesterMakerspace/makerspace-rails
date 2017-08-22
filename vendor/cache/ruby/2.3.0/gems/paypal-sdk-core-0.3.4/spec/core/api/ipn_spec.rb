require 'spec_helper'

describe PayPal::SDK::Core::API::IPN do

  IPN = PayPal::SDK::Core::API::IPN

  describe "Configuration" do
    it "set IPN endpoint" do
      message = IPN::Message.new("")
      message.ipn_endpoint.should eql "https://www.sandbox.paypal.com/cgi-bin/webscr"
      message = IPN::Message.new("", :mode => :sandbox)
      message.ipn_endpoint.should eql "https://www.sandbox.paypal.com/cgi-bin/webscr"

      message = IPN::Message.new("", :mode => :live)
      message.ipn_endpoint.should eql "https://www.paypal.com/cgi-bin/webscr"

      message = IPN::Message.new("", :ipn_endpoint => "http://example.com")
      message.ipn_endpoint.should eql "http://example.com"
    end
  end

  describe "Valid" do
    it "request" do
      response = IPN.request(samples["ipn"]["valid_message"])
      expect(response.body).to eql IPN::VERIFIED
    end

    it "valid?" do
      response = IPN.valid?(samples["ipn"]["valid_message"])
      expect(response).to be_truthy
    end
  end

  describe "Invalid" do
    it "request" do
      response = IPN.request(samples["ipn"]["invalid_message"])
      expect(response.body).to eql IPN::INVALID
    end

    it "valid?" do
      response = IPN.valid?(samples["ipn"]["invalid_message"])
      expect(response).to be_falsy
    end
  end

end
