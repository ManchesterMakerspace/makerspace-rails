require 'spec_helper'

describe PayPal::SDK::Core::Config do

  Config = PayPal::SDK::Core::Config

  it "load configuration file and default environment" do
    lambda {
      Config.load("spec/config/paypal.yml", "test")
      Config.default_environment.should eql "test"
    }.should_not raise_error
  end

  it "Set default environment" do
    begin
      backup_default_environment = Config.default_environment
      Config.default_environment = "new_env"
      Config.default_environment.should eql "new_env"
    ensure
      Config.default_environment = backup_default_environment
    end
  end

  it "Set configurations" do
    begin
      backup_configurations = Config.configurations
      Config.configurations = { Config.default_environment => { :username => "direct", :password => "direct" } }
      Config.config.username.should eql "direct"
      Config.config.password.should eql "direct"
      Config.config.signature.should be_nil
    ensure
      Config.configurations = backup_configurations
    end
  end

  it "Configure with parameters" do
    begin
      backup_configurations = Config.configurations
      Config.configurations = nil
      Config.configure( :username => "Testing" )
      Config.config.username.should eql "Testing"
      Config.config.app_id.should be_nil
    ensure
      Config.configurations = backup_configurations
    end
  end

  it "Configure with block" do
    begin
      backup_configurations = Config.configurations
      Config.configurations = nil
      Config.configure do |config|
        config.username = "Testing"
      end
      Config.config.username.should eql "Testing"
      Config.config.app_id.should be_nil
    ensure
      Config.configurations = backup_configurations
    end
  end

  it "Configure with default values" do
    begin
      backup_configurations = Config.configurations
      default_config = Config.config
      Config.configure do |config|
        config.username = "Testing"
      end
      Config.config.username.should eql "Testing"
      Config.config.app_id.should_not be_nil
      Config.config.app_id.should eql default_config.app_id
    ensure
      Config.configurations = backup_configurations
    end
  end

  it "validate configuration" do
    config = Config.new( :username => "XYZ")
    lambda {
      config.required!(:username)
    }.should_not raise_error
    lambda {
      config.required!(:password)
    }.should raise_error "Required configuration(password)"
    lambda {
      config.required!(:username, :password)
    }.should raise_error "Required configuration(password)"
    lambda {
      config.required!(:password, :signature)
    }.should raise_error "Required configuration(password, signature)"
  end

  it "return default environment configuration" do
    Config.config.should be_a Config
  end

  it "return configuration based on environment" do
    Config.config(:development).should be_a Config
  end

  it "override default configuration" do
    override_configuration = { :username => "test.example.com", :app_id => "test"}
    config = Config.config(override_configuration)

    config.username.should eql(override_configuration[:username])
    config.app_id.should eql(override_configuration[:app_id])
  end

  it "get cached config" do
    Config.config(:test).should eql Config.config(:test)
    Config.config(:test).should_not eql Config.config(:development)
  end

  it "should raise error on invalid environment" do
    lambda {
      Config.config(:invalid_env)
    }.should raise_error "Configuration[invalid_env] NotFound"
  end

  it "set logger" do
    require 'logger'
    my_logger = Logger.new(STDERR)
    Config.logger = my_logger
    Config.logger.should eql my_logger
  end

  it "Access PayPal::SDK methods" do
    PayPal::SDK.configure.should eql PayPal::SDK::Core::Config.config
    PayPal::SDK.logger.should eql PayPal::SDK::Core::Config.logger
    PayPal::SDK.logger = PayPal::SDK.logger
    PayPal::SDK.logger.should eql PayPal::SDK::Core::Config.logger
  end

  describe "include Configuration" do
    class TestConfig
      include PayPal::SDK::Core::Configuration
    end

    it "Get default configuration" do
      test_object = TestConfig.new
      test_object.config.should be_a Config
    end

    it "Change environment" do
      test_object = TestConfig.new
      test_object.set_config("test")
      test_object.config.should eql Config.config("test")
      test_object.config.should_not eql Config.config("development")
    end

    it "Override environment configuration" do
      test_object = TestConfig.new
      test_object.set_config("test", :username => "test")
      test_object.config.should_not eql Config.config("test")
    end

    it "Override default/current configuration" do
      test_object = TestConfig.new
      test_object.set_config( :username => "test")
      test_object.config.username.should eql "test"
      test_object.set_config( :password => "test")
      test_object.config.password.should eql "test"
      test_object.config.username.should eql "test"
    end

    it "Append ssl_options" do
      test_object = TestConfig.new
      test_object.set_config( :ssl_options => { :ca_file => "test_path" } )
      test_object.config.ssl_options[:ca_file].should eql "test_path"
      test_object.set_config( :ssl_options => { :verify_mode => 1 } )
      test_object.config.ssl_options[:verify_mode].should eql 1
      test_object.config.ssl_options[:ca_file].should eql "test_path"
    end

    it "Set configuration without loading configuration File" do
      backup_configurations = Config.configurations
      begin
        Config.configurations = nil
        test_object = TestConfig.new
        lambda {
          test_object.config
        }.should raise_error
        test_object.set_config( :username => "test" )
        test_object.config.should be_a Config
      ensure
        Config.configurations = backup_configurations
      end
    end

  end

end
