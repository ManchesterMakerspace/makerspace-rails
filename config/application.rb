require_relative 'boot'

require "rails"
# Pick the frameworks you want:
# require "active_record/railtie"
require "active_model/railtie"
require "active_job/railtie"
require "action_view/railtie"
require "action_cable/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "sprockets/railtie"
require "rails/test_unit/railtie"

require 'dotenv'
if (ENV["RAILS_ENV"] == 'production')
  Dotenv.load('production.env')
elsif (ENV["RAILS_ENV"] == 'development')
  Dotenv.load('development.env')
else
  Dotenv.load('test.env')
end

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)
Mongoid.load!('config/mongoid.yml')

module MemberInterface
  class Application < Rails::Application
    config.autoload_paths << "#{Rails.root}/lib"
    config.eager_load_paths << "#{Rails.root}/lib"

    if Rails.env.development?
      config.action_mailer.preview_path = "#{Rails.root}/spec/mailers/previews"
    end

    config.to_prepare do
      DeviseController.respond_to :json
    end
    Rails.application.config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins '*'
        resource '*', headers: :any, methods: [:get, :post, :options, :patch, :delete], expose: ['total-items']
      end
    end
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
  end
end
