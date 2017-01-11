# -*- encoding: utf-8 -*-
# stub: websocket-client-simple 0.3.0 ruby lib

Gem::Specification.new do |s|
  s.name = "websocket-client-simple"
  s.version = "0.3.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Sho Hashimoto"]
  s.date = "2016-02-20"
  s.description = "Simple WebSocket Client for Ruby"
  s.email = ["hashimoto@shokai.org"]
  s.homepage = "https://github.com/shokai/websocket-client-simple"
  s.licenses = ["MIT"]
  s.rubygems_version = "2.4.8"
  s.summary = "Simple WebSocket Client for Ruby"

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<bundler>, ["~> 1.3"])
      s.add_development_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<minitest>, [">= 0"])
      s.add_development_dependency(%q<websocket-eventmachine-server>, [">= 0"])
      s.add_development_dependency(%q<eventmachine>, [">= 0"])
      s.add_runtime_dependency(%q<websocket>, [">= 0"])
      s.add_runtime_dependency(%q<event_emitter>, [">= 0"])
    else
      s.add_dependency(%q<bundler>, ["~> 1.3"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<minitest>, [">= 0"])
      s.add_dependency(%q<websocket-eventmachine-server>, [">= 0"])
      s.add_dependency(%q<eventmachine>, [">= 0"])
      s.add_dependency(%q<websocket>, [">= 0"])
      s.add_dependency(%q<event_emitter>, [">= 0"])
    end
  else
    s.add_dependency(%q<bundler>, ["~> 1.3"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<minitest>, [">= 0"])
    s.add_dependency(%q<websocket-eventmachine-server>, [">= 0"])
    s.add_dependency(%q<eventmachine>, [">= 0"])
    s.add_dependency(%q<websocket>, [">= 0"])
    s.add_dependency(%q<event_emitter>, [">= 0"])
  end
end
