# -*- encoding: utf-8 -*-
# stub: gettext 3.2.2 ruby lib

Gem::Specification.new do |s|
  s.name = "gettext"
  s.version = "3.2.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Kouhei Sutou", "Masao Mutoh"]
  s.date = "2016-04-17"
  s.description = "Gettext is a GNU gettext-like program for Ruby.\nThe catalog file(po-file) is same format with GNU gettext.\nSo you can use GNU gettext tools for maintaining.\n"
  s.email = ["kou@clear-code.com", "mutomasa at gmail.com"]
  s.executables = ["rmsginit", "rmsgfmt", "rmsgcat", "rxgettext", "rmsgmerge"]
  s.files = ["bin/rmsgcat", "bin/rmsgfmt", "bin/rmsginit", "bin/rmsgmerge", "bin/rxgettext"]
  s.homepage = "http://ruby-gettext.github.com/"
  s.licenses = ["Ruby or LGPLv3+"]
  s.rubyforge_project = "gettext"
  s.rubygems_version = "2.4.8"
  s.summary = "Gettext is a pure Ruby libary and tools to localize messages."

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<locale>, [">= 2.0.5"])
      s.add_runtime_dependency(%q<text>, [">= 1.3.0"])
      s.add_development_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<racc>, [">= 0"])
      s.add_development_dependency(%q<yard>, [">= 0"])
      s.add_development_dependency(%q<kramdown>, [">= 0"])
      s.add_development_dependency(%q<test-unit>, [">= 0"])
      s.add_development_dependency(%q<test-unit-notify>, [">= 0"])
      s.add_development_dependency(%q<test-unit-rr>, [">= 0"])
    else
      s.add_dependency(%q<locale>, [">= 2.0.5"])
      s.add_dependency(%q<text>, [">= 1.3.0"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<racc>, [">= 0"])
      s.add_dependency(%q<yard>, [">= 0"])
      s.add_dependency(%q<kramdown>, [">= 0"])
      s.add_dependency(%q<test-unit>, [">= 0"])
      s.add_dependency(%q<test-unit-notify>, [">= 0"])
      s.add_dependency(%q<test-unit-rr>, [">= 0"])
    end
  else
    s.add_dependency(%q<locale>, [">= 2.0.5"])
    s.add_dependency(%q<text>, [">= 1.3.0"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<racc>, [">= 0"])
    s.add_dependency(%q<yard>, [">= 0"])
    s.add_dependency(%q<kramdown>, [">= 0"])
    s.add_dependency(%q<test-unit>, [">= 0"])
    s.add_dependency(%q<test-unit-notify>, [">= 0"])
    s.add_dependency(%q<test-unit-rr>, [">= 0"])
  end
end
