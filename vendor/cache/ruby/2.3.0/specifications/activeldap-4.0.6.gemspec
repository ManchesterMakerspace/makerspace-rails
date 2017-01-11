# -*- encoding: utf-8 -*-
# stub: activeldap 4.0.6 ruby lib

Gem::Specification.new do |s|
  s.name = "activeldap"
  s.version = "4.0.6"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Will Drewry", "Kouhei Sutou"]
  s.date = "2016-04-07"
  s.description = "    'ActiveLdap' is a ruby library which provides a clean\n    objected oriented interface to the Ruby/LDAP library.  It was inspired\n    by ActiveRecord. This is not nearly as clean or as flexible as\n    ActiveRecord, but it is still trivial to define new objects and manipulate\n    them with minimal difficulty.\n"
  s.email = ["redpig@dataspill.org", "kou@cozmixng.org"]
  s.homepage = "http://activeldap.github.io/"
  s.licenses = ["Ruby's", "GPLv2 or later"]
  s.rubyforge_project = "ruby-activeldap"
  s.rubygems_version = "2.4.8"
  s.summary = "ActiveLdap is a object-oriented API to LDAP"

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<activemodel>, ["> 4.0.0"])
      s.add_runtime_dependency(%q<locale>, [">= 0"])
      s.add_runtime_dependency(%q<gettext>, [">= 0"])
      s.add_runtime_dependency(%q<gettext_i18n_rails>, [">= 0"])
      s.add_development_dependency(%q<bundler>, [">= 0"])
      s.add_development_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<test-unit>, [">= 0"])
      s.add_development_dependency(%q<test-unit-notify>, [">= 0"])
      s.add_development_dependency(%q<yard>, [">= 0"])
      s.add_development_dependency(%q<RedCloth>, [">= 0"])
      s.add_development_dependency(%q<packnga>, [">= 0"])
    else
      s.add_dependency(%q<activemodel>, ["> 4.0.0"])
      s.add_dependency(%q<locale>, [">= 0"])
      s.add_dependency(%q<gettext>, [">= 0"])
      s.add_dependency(%q<gettext_i18n_rails>, [">= 0"])
      s.add_dependency(%q<bundler>, [">= 0"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<test-unit>, [">= 0"])
      s.add_dependency(%q<test-unit-notify>, [">= 0"])
      s.add_dependency(%q<yard>, [">= 0"])
      s.add_dependency(%q<RedCloth>, [">= 0"])
      s.add_dependency(%q<packnga>, [">= 0"])
    end
  else
    s.add_dependency(%q<activemodel>, ["> 4.0.0"])
    s.add_dependency(%q<locale>, [">= 0"])
    s.add_dependency(%q<gettext>, [">= 0"])
    s.add_dependency(%q<gettext_i18n_rails>, [">= 0"])
    s.add_dependency(%q<bundler>, [">= 0"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<test-unit>, [">= 0"])
    s.add_dependency(%q<test-unit-notify>, [">= 0"])
    s.add_dependency(%q<yard>, [">= 0"])
    s.add_dependency(%q<RedCloth>, [">= 0"])
    s.add_dependency(%q<packnga>, [">= 0"])
  end
end
