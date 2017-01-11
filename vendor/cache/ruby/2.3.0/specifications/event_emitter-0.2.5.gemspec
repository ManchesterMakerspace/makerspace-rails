# -*- encoding: utf-8 -*-
# stub: event_emitter 0.2.5 ruby lib

Gem::Specification.new do |s|
  s.name = "event_emitter"
  s.version = "0.2.5"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Sho Hashimoto"]
  s.date = "2013-03-31"
  s.description = "Ruby port of EventEmitter from Node.js"
  s.email = ["hashimoto@shokai.org"]
  s.homepage = "http://shokai.github.com/event_emitter"
  s.rubygems_version = "2.4.8"
  s.summary = "Ruby port of EventEmitter from Node.js"

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<minitest>, [">= 0"])
      s.add_development_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<bundler>, ["~> 1.3"])
    else
      s.add_dependency(%q<minitest>, [">= 0"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<bundler>, ["~> 1.3"])
    end
  else
    s.add_dependency(%q<minitest>, [">= 0"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<bundler>, ["~> 1.3"])
  end
end
