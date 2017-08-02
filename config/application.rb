require_relative 'boot'

# Pick the frameworks you want:
# require "active_record/railtie"
require "action_controller/railtie"
require "active_model/railtie"
require "active_job/railtie"
require "action_view/railtie"
require "action_cable/engine"
require "action_mailer/railtie"
require "sprockets/railtie"
require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)
Mongoid.load!('config/mongoid.yml')

module MemberInterface
  class Application < Rails::Application

    config.to_prepare do
      DeviseController.respond_to :html, :json
    end
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
  end
end
