# -*- encoding: utf-8 -*-
# stub: mongoid 6.0.3 ruby lib

Gem::Specification.new do |s|
  s.name = "mongoid"
  s.version = "6.0.3"

  s.required_rubygems_version = Gem::Requirement.new(">= 1.3.6") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Durran Jordan"]
  s.cert_chain = ["-----BEGIN CERTIFICATE-----\nMIIDfDCCAmSgAwIBAgIBATANBgkqhkiG9w0BAQUFADBCMRQwEgYDVQQDDAtkcml2\nZXItcnVieTEVMBMGCgmSJomT8ixkARkWBTEwZ2VuMRMwEQYKCZImiZPyLGQBGRYD\nY29tMB4XDTE2MTIwMTE0MDcxMloXDTE3MTIwMTE0MDcxMlowQjEUMBIGA1UEAwwL\nZHJpdmVyLXJ1YnkxFTATBgoJkiaJk/IsZAEZFgUxMGdlbjETMBEGCgmSJomT8ixk\nARkWA2NvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANFdSAa8fRm1\nbAM9za6Z0fAH4g02bqM1NGnw8zJQrE/PFrFfY6IFCT2AsLfOwr1maVm7iU1+kdVI\nIQ+iI/9+E+ArJ+rbGV3dDPQ+SLl3mLT+vXjfjcxMqI2IW6UuVtt2U3Rxd4QU0kdT\nJxmcPYs5fDN6BgYc6XXgUjy3m+Kwha2pGctdciUOwEfOZ4RmNRlEZKCMLRHdFP8j\n4WTnJSGfXDiuoXICJb5yOPOZPuaapPSNXp93QkUdsqdKC32I+KMpKKYGBQ6yisfA\n5MyVPPCzLR1lP5qXVGJPnOqUAkvEUfCahg7EP9tI20qxiXrR6TSEraYhIFXL0EGY\nu8KAcPHm5KkCAwEAAaN9MHswCQYDVR0TBAIwADALBgNVHQ8EBAMCBLAwHQYDVR0O\nBBYEFFt3WbF+9JpUjAoj62cQBgNb8HzXMCAGA1UdEQQZMBeBFWRyaXZlci1ydWJ5\nQDEwZ2VuLmNvbTAgBgNVHRIEGTAXgRVkcml2ZXItcnVieUAxMGdlbi5jb20wDQYJ\nKoZIhvcNAQEFBQADggEBAKBDaVkycCUC1zMfpAkXIgWtji2Nr2ZygYQR53AgxOaE\n7nqxdh5Lh8pnfwa71/ucrZFJt+g/mEhen9lFNmcizvpP43Hh4rYf8j6T8Y+mQ6tr\nsp5xWiv93DlLXGmas0hv9VRYDvV1vLFaG05FHOAZKdo6pD2t6jNyMSAn4fMHKctw\nUoYN5FLt84jacRQF5nhy9gBhfgvA19LcjeMLQC11x3fykDLzCXF2wEe5Q5iYaWvb\ncGiNQIiHBj/9/xHfOyOthBPUevTiVnuffarDr434z/LGLwYzgaG5EcJFvZqpvUpP\nfGcAPtAZUMGLXwcOB1BJEFkDxUQIJiEpSmf4YzzZhEM=\n-----END CERTIFICATE-----\n"]
  s.date = "2016-12-02"
  s.description = "Mongoid is an ODM (Object Document Mapper) Framework for MongoDB, written in Ruby."
  s.email = ["mongodb-dev@googlegroups.com"]
  s.homepage = "http://mongoid.org"
  s.licenses = ["MIT"]
  s.required_ruby_version = Gem::Requirement.new(">= 2.2")
  s.rubyforge_project = "mongoid"
  s.rubygems_version = "2.4.8"
  s.summary = "Elegant Persistence in Ruby for MongoDB."

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<activemodel>, ["~> 5.0"])
      s.add_runtime_dependency(%q<mongo>, ["~> 2.3"])
    else
      s.add_dependency(%q<activemodel>, ["~> 5.0"])
      s.add_dependency(%q<mongo>, ["~> 2.3"])
    end
  else
    s.add_dependency(%q<activemodel>, ["~> 5.0"])
    s.add_dependency(%q<mongo>, ["~> 2.3"])
  end
end
