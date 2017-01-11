# -*- encoding: utf-8 -*-
# stub: bootstrap-datepicker-rails 1.6.4.1 ruby lib

Gem::Specification.new do |s|
  s.name = "bootstrap-datepicker-rails"
  s.version = "1.6.4.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Gonzalo Rodr\u{ed}guez-Baltan\u{e1}s D\u{ed}az"]
  s.date = "2016-08-17"
  s.description = "A date picker for Twitter Bootstrap"
  s.email = ["siotopo@gmail.com"]
  s.homepage = "https://github.com/Nerian/bootstrap-datepicker-rails"
  s.licenses = ["MIT"]
  s.rubygems_version = "2.4.8"
  s.summary = "A date picker for Twitter Bootstrap"

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<railties>, [">= 3.0"])
      s.add_development_dependency(%q<bundler>, [">= 1.0"])
      s.add_development_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<pry>, [">= 0"])
      s.add_development_dependency(%q<json>, [">= 0"])
    else
      s.add_dependency(%q<railties>, [">= 3.0"])
      s.add_dependency(%q<bundler>, [">= 1.0"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<pry>, [">= 0"])
      s.add_dependency(%q<json>, [">= 0"])
    end
  else
    s.add_dependency(%q<railties>, [">= 3.0"])
    s.add_dependency(%q<bundler>, [">= 1.0"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<pry>, [">= 0"])
    s.add_dependency(%q<json>, [">= 0"])
  end
end
