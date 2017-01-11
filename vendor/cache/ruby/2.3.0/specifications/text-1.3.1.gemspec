# -*- encoding: utf-8 -*-
# stub: text 1.3.1 ruby lib

Gem::Specification.new do |s|
  s.name = "text"
  s.version = "1.3.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Paul Battley", "Michael Neumann", "Tim Fletcher"]
  s.date = "2015-04-13"
  s.description = "A collection of text algorithms: Levenshtein, Soundex, Metaphone, Double Metaphone, Porter Stemming"
  s.email = "pbattley@gmail.com"
  s.extra_rdoc_files = ["README.rdoc", "COPYING.txt"]
  s.files = ["COPYING.txt", "README.rdoc"]
  s.homepage = "http://github.com/threedaymonk/text"
  s.licenses = ["MIT"]
  s.rubyforge_project = "text"
  s.rubygems_version = "2.4.8"
  s.summary = "A collection of text algorithms"

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<rake>, ["~> 10.0"])
    else
      s.add_dependency(%q<rake>, ["~> 10.0"])
    end
  else
    s.add_dependency(%q<rake>, ["~> 10.0"])
  end
end
