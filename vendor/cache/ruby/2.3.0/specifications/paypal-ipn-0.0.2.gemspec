# -*- encoding: utf-8 -*-
# stub: paypal-ipn 0.0.2 ruby lib

Gem::Specification.new do |s|
  s.name = "paypal-ipn"
  s.version = "0.0.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["David Wilkie"]
  s.date = "2010-11-15"
  s.description = "A ruby library for handling paypal api's including IPNs"
  s.email = ["dwilkie@gmail.com"]
  s.homepage = "https://github.com/dwilkie/paypal"
  s.rubyforge_project = "paypal"
  s.rubygems_version = "2.4.8"
  s.summary = "More than just IPNs"

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<httparty>, [">= 0"])
    else
      s.add_dependency(%q<httparty>, [">= 0"])
    end
  else
    s.add_dependency(%q<httparty>, [">= 0"])
  end
end
