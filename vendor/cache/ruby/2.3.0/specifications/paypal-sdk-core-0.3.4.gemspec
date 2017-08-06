# -*- encoding: utf-8 -*-
# stub: paypal-sdk-core 0.3.4 ruby lib

Gem::Specification.new do |s|
  s.name = "paypal-sdk-core"
  s.version = "0.3.4"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["PayPal"]
  s.date = "2015-12-16"
  s.description = "Core library for PayPal ruby SDKs"
  s.email = ["DL-PP-Platform-Ruby-SDK@paypal.com"]
  s.homepage = "https://developer.paypal.com"
  s.licenses = ["PayPal SDK License"]
  s.rubygems_version = "2.4.8"
  s.summary = "Core library for PayPal ruby SDKs"

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<xml-simple>, [">= 0"])
      s.add_runtime_dependency(%q<multi_json>, ["~> 1.0"])
    else
      s.add_dependency(%q<xml-simple>, [">= 0"])
      s.add_dependency(%q<multi_json>, ["~> 1.0"])
    end
  else
    s.add_dependency(%q<xml-simple>, [">= 0"])
    s.add_dependency(%q<multi_json>, ["~> 1.0"])
  end
end
