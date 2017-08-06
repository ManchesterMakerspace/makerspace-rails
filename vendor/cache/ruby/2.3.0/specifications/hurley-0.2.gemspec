# -*- encoding: utf-8 -*-
# stub: hurley 0.2 ruby lib

Gem::Specification.new do |s|
  s.name = "hurley"
  s.version = "0.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Rick Olson", "Wynn Netherland", "Ben Maraney", "Kevin Kirsche"]
  s.date = "2015-09-05"
  s.description = "Hurley provides a common interface for working with different HTTP adapters."
  s.email = ["technoweenie@gmail.com", "kev.kirsche@gmail.com"]
  s.homepage = "https://github.com/lostisland/hurley"
  s.licenses = ["MIT"]
  s.rubygems_version = "2.4.8"
  s.summary = "HTTP client wrapper"

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<bundler>, ["~> 1.0"])
    else
      s.add_dependency(%q<bundler>, ["~> 1.0"])
    end
  else
    s.add_dependency(%q<bundler>, ["~> 1.0"])
  end
end
