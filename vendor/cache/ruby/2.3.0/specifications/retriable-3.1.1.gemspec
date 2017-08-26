# -*- encoding: utf-8 -*-
# stub: retriable 3.1.1 ruby lib

Gem::Specification.new do |s|
  s.name = "retriable"
  s.version = "3.1.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Jack Chu"]
  s.date = "2017-07-29"
  s.description = "Retriable is an simple DSL to retry failed code blocks with randomized exponential backoff. This is especially useful when interacting external api/services or file system calls."
  s.email = ["jack@jackchu.com"]
  s.homepage = "http://github.com/kamui/retriable"
  s.licenses = ["MIT"]
  s.required_ruby_version = Gem::Requirement.new(">= 2.0.0")
  s.rubygems_version = "2.4.8"
  s.summary = "Retriable is an simple DSL to retry failed code blocks with randomized exponential backoff"

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<bundler>, [">= 0"])
      s.add_development_dependency(%q<rake>, ["~> 12.0"])
      s.add_development_dependency(%q<minitest>, ["~> 5.10"])
      s.add_development_dependency(%q<guard>, [">= 0"])
      s.add_development_dependency(%q<guard-minitest>, [">= 0"])
      s.add_development_dependency(%q<listen>, ["~> 3.1"])
    else
      s.add_dependency(%q<bundler>, [">= 0"])
      s.add_dependency(%q<rake>, ["~> 12.0"])
      s.add_dependency(%q<minitest>, ["~> 5.10"])
      s.add_dependency(%q<guard>, [">= 0"])
      s.add_dependency(%q<guard-minitest>, [">= 0"])
      s.add_dependency(%q<listen>, ["~> 3.1"])
    end
  else
    s.add_dependency(%q<bundler>, [">= 0"])
    s.add_dependency(%q<rake>, ["~> 12.0"])
    s.add_dependency(%q<minitest>, ["~> 5.10"])
    s.add_dependency(%q<guard>, [">= 0"])
    s.add_dependency(%q<guard-minitest>, [">= 0"])
    s.add_dependency(%q<listen>, ["~> 3.1"])
  end
end
