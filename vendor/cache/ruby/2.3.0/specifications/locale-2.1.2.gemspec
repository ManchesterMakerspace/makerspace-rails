# -*- encoding: utf-8 -*-
# stub: locale 2.1.2 ruby lib

Gem::Specification.new do |s|
  s.name = "locale"
  s.version = "2.1.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Kouhei Sutou", "Masao Mutoh"]
  s.date = "2015-09-15"
  s.description = "Ruby-Locale is the pure ruby library which provides basic APIs for localization.\n"
  s.email = ["kou@clear-code.com", "mutomasa at gmail.com"]
  s.homepage = "https://github.com/ruby-gettext/locale"
  s.licenses = ["Ruby", "LGPLv3+"]
  s.rubygems_version = "2.4.8"
  s.summary = "Ruby-Locale is the pure ruby library which provides basic APIs for localization."

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<bundler>, [">= 0"])
      s.add_development_dependency(%q<yard>, [">= 0"])
      s.add_development_dependency(%q<redcarpet>, [">= 0"])
      s.add_development_dependency(%q<test-unit>, [">= 0"])
      s.add_development_dependency(%q<test-unit-notify>, [">= 0"])
      s.add_development_dependency(%q<test-unit-rr>, [">= 0"])
    else
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<bundler>, [">= 0"])
      s.add_dependency(%q<yard>, [">= 0"])
      s.add_dependency(%q<redcarpet>, [">= 0"])
      s.add_dependency(%q<test-unit>, [">= 0"])
      s.add_dependency(%q<test-unit-notify>, [">= 0"])
      s.add_dependency(%q<test-unit-rr>, [">= 0"])
    end
  else
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<bundler>, [">= 0"])
    s.add_dependency(%q<yard>, [">= 0"])
    s.add_dependency(%q<redcarpet>, [">= 0"])
    s.add_dependency(%q<test-unit>, [">= 0"])
    s.add_dependency(%q<test-unit-notify>, [">= 0"])
    s.add_dependency(%q<test-unit-rr>, [">= 0"])
  end
end
