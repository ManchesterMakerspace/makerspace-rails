# -*- encoding: utf-8 -*-
# stub: gettext_i18n_rails 1.8.0 ruby lib

Gem::Specification.new do |s|
  s.name = "gettext_i18n_rails"
  s.version = "1.8.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Michael Grosser"]
  s.date = "2016-08-11"
  s.email = "michael@grosser.it"
  s.homepage = "http://github.com/grosser/gettext_i18n_rails"
  s.licenses = ["MIT"]
  s.required_ruby_version = Gem::Requirement.new(">= 2.1.0")
  s.rubygems_version = "2.4.8"
  s.summary = "Simple FastGettext Rails integration."

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<fast_gettext>, [">= 0.9.0"])
      s.add_development_dependency(%q<bump>, [">= 0"])
      s.add_development_dependency(%q<gettext>, [">= 3.0.2"])
      s.add_development_dependency(%q<haml>, [">= 0"])
      s.add_development_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<rails>, [">= 0"])
      s.add_development_dependency(%q<ruby_parser>, [">= 3.7.1"])
      s.add_development_dependency(%q<sexp_processor>, [">= 0"])
      s.add_development_dependency(%q<rspec>, [">= 0"])
      s.add_development_dependency(%q<slim>, [">= 0"])
      s.add_development_dependency(%q<sqlite3>, [">= 0"])
      s.add_development_dependency(%q<wwtd>, [">= 0"])
    else
      s.add_dependency(%q<fast_gettext>, [">= 0.9.0"])
      s.add_dependency(%q<bump>, [">= 0"])
      s.add_dependency(%q<gettext>, [">= 3.0.2"])
      s.add_dependency(%q<haml>, [">= 0"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<rails>, [">= 0"])
      s.add_dependency(%q<ruby_parser>, [">= 3.7.1"])
      s.add_dependency(%q<sexp_processor>, [">= 0"])
      s.add_dependency(%q<rspec>, [">= 0"])
      s.add_dependency(%q<slim>, [">= 0"])
      s.add_dependency(%q<sqlite3>, [">= 0"])
      s.add_dependency(%q<wwtd>, [">= 0"])
    end
  else
    s.add_dependency(%q<fast_gettext>, [">= 0.9.0"])
    s.add_dependency(%q<bump>, [">= 0"])
    s.add_dependency(%q<gettext>, [">= 3.0.2"])
    s.add_dependency(%q<haml>, [">= 0"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<rails>, [">= 0"])
    s.add_dependency(%q<ruby_parser>, [">= 3.7.1"])
    s.add_dependency(%q<sexp_processor>, [">= 0"])
    s.add_dependency(%q<rspec>, [">= 0"])
    s.add_dependency(%q<slim>, [">= 0"])
    s.add_dependency(%q<sqlite3>, [">= 0"])
    s.add_dependency(%q<wwtd>, [">= 0"])
  end
end
