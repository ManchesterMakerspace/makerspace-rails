# -*- encoding: utf-8 -*-
# stub: paypal-sdk-merchant 1.117.2 ruby lib

Gem::Specification.new do |s|
  s.name = "paypal-sdk-merchant"
  s.version = "1.117.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["PayPal"]
  s.date = "2015-08-25"
  s.description = "The PayPal Merchant SDK provides Ruby APIs for processing payments, recurring payments, subscriptions and transactions using PayPal's Merchant APIs, which include Express Checkout, Recurring Payments, Direct Payment and Transactional APIs."
  s.email = ["DL-PP-Platform-Ruby-SDK@paypal.com"]
  s.homepage = "https://developer.paypal.com"
  s.licenses = ["PayPal SDK License"]
  s.rubygems_version = "2.4.8"
  s.summary = "PayPal Merchant SDK"

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<paypal-sdk-core>, ["~> 0.3.0"])
    else
      s.add_dependency(%q<paypal-sdk-core>, ["~> 0.3.0"])
    end
  else
    s.add_dependency(%q<paypal-sdk-core>, ["~> 0.3.0"])
  end
end
