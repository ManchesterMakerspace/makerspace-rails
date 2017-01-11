# -*- encoding: utf-8 -*-
# stub: mongo 2.4.1 ruby lib

Gem::Specification.new do |s|
  s.name = "mongo"
  s.version = "2.4.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Tyler Brock", "Emily Stolfo", "Durran Jordan"]
  s.cert_chain = ["-----BEGIN CERTIFICATE-----\nMIIDfDCCAmSgAwIBAgIBATANBgkqhkiG9w0BAQUFADBCMRQwEgYDVQQDDAtkcml2\nZXItcnVieTEVMBMGCgmSJomT8ixkARkWBTEwZ2VuMRMwEQYKCZImiZPyLGQBGRYD\nY29tMB4XDTE2MTIyMDEzMzc1N1oXDTE3MTIyMDEzMzc1N1owQjEUMBIGA1UEAwwL\nZHJpdmVyLXJ1YnkxFTATBgoJkiaJk/IsZAEZFgUxMGdlbjETMBEGCgmSJomT8ixk\nARkWA2NvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANFdSAa8fRm1\nbAM9za6Z0fAH4g02bqM1NGnw8zJQrE/PFrFfY6IFCT2AsLfOwr1maVm7iU1+kdVI\nIQ+iI/9+E+ArJ+rbGV3dDPQ+SLl3mLT+vXjfjcxMqI2IW6UuVtt2U3Rxd4QU0kdT\nJxmcPYs5fDN6BgYc6XXgUjy3m+Kwha2pGctdciUOwEfOZ4RmNRlEZKCMLRHdFP8j\n4WTnJSGfXDiuoXICJb5yOPOZPuaapPSNXp93QkUdsqdKC32I+KMpKKYGBQ6yisfA\n5MyVPPCzLR1lP5qXVGJPnOqUAkvEUfCahg7EP9tI20qxiXrR6TSEraYhIFXL0EGY\nu8KAcPHm5KkCAwEAAaN9MHswCQYDVR0TBAIwADALBgNVHQ8EBAMCBLAwHQYDVR0O\nBBYEFFt3WbF+9JpUjAoj62cQBgNb8HzXMCAGA1UdEQQZMBeBFWRyaXZlci1ydWJ5\nQDEwZ2VuLmNvbTAgBgNVHRIEGTAXgRVkcml2ZXItcnVieUAxMGdlbi5jb20wDQYJ\nKoZIhvcNAQEFBQADggEBABls+be8yTD61iZd+lMwdTu5hx9xVWiNssI/MuNfuZzo\nW7g7AUDrMXELJN9NwNFSFJw4vsAlfzl5sB2G3oCLef93vH4NwrTV4v5FIAk7mq8t\nVLxoMWt6uUTo4t957Nvd8Amuukum1AZx6n3IjxpI3UhoFd7JrJNfvPYkyrwcu6Ur\nxk02yzVtV1mZbklvKKIelCALBeuWkIMcmJXMbjn759OOm2YbrJpEsY79W9zLdgZf\nJORAC0isugdrjOh+7HDizWC+9xpvSdKSuNso9bVKO3czaBeR+i+IA43wWeUliq95\n5mp49lUwPrMEh694iPac5m+oxYlcU5U+sUyArQXg+lk=\n-----END CERTIFICATE-----\n"]
  s.date = "2016-12-20"
  s.description = "A Ruby driver for MongoDB"
  s.email = "mongodb-dev@googlegroups.com"
  s.executables = ["mongo_console"]
  s.files = ["bin/mongo_console"]
  s.homepage = "http://www.mongodb.org"
  s.licenses = ["Apache License Version 2.0"]
  s.rubygems_version = "2.4.8"
  s.summary = "Ruby driver for MongoDB"

  s.installed_by_version = "2.4.8" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<bson>, ["< 5.0.0", ">= 4.2.1"])
    else
      s.add_dependency(%q<bson>, ["< 5.0.0", ">= 4.2.1"])
    end
  else
    s.add_dependency(%q<bson>, ["< 5.0.0", ">= 4.2.1"])
  end
end
