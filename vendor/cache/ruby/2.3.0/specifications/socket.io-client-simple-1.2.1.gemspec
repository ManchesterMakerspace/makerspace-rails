# -*- encoding: utf-8 -*-
# stub: socket.io-client-simple 1.2.1 ruby lib

Gem::Specification.new do |s|
  s.name = "socket.io-client-simple"
  s.version = "1.2.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Sho Hashimoto"]
  s.date = "2016-02-20"
  s.description = "A simple ruby client for Node.js's Socket.IO v1.1.x, Supports only WebSocket."
  s.email = ["hashimoto@shokai.org"]
  s.homepage = "https://github.com/shokai/ruby-socket.io-client-simple"
  s.licenses = ["MIT"]
  s.rubygems_version = "2.4.8"
  s.summary = "A simple ruby client for Node.js's Socket.IO v1.1.x, Supports only WebSocket."

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<bundler>, ["~> 1.3"])
      s.add_development_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<minitest>, [">= 0"])
      s.add_runtime_dependency(%q<json>, [">= 0"])
      s.add_runtime_dependency(%q<websocket-client-simple>, ["~> 0.3.0"])
      s.add_runtime_dependency(%q<httparty>, [">= 0"])
      s.add_runtime_dependency(%q<event_emitter>, [">= 0"])
    else
      s.add_dependency(%q<bundler>, ["~> 1.3"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<minitest>, [">= 0"])
      s.add_dependency(%q<json>, [">= 0"])
      s.add_dependency(%q<websocket-client-simple>, ["~> 0.3.0"])
      s.add_dependency(%q<httparty>, [">= 0"])
      s.add_dependency(%q<event_emitter>, [">= 0"])
    end
  else
    s.add_dependency(%q<bundler>, ["~> 1.3"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<minitest>, [">= 0"])
    s.add_dependency(%q<json>, [">= 0"])
    s.add_dependency(%q<websocket-client-simple>, ["~> 0.3.0"])
    s.add_dependency(%q<httparty>, [">= 0"])
    s.add_dependency(%q<event_emitter>, [">= 0"])
  end
end
