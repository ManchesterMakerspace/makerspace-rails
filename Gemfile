source 'https://rubygems.org'
ruby '2.6.9'

gem 'rails', '~> 6.0.6.1'
gem 'rack-cors'
gem 'puma', '~> 4.3'
gem 'active_model_serializers', '~> 0.10.15'
gem 'dotenv-rails'
gem 'concurrent-ruby', '1.3.4'

# Redis Cache and Event Bus
gem 'redis'
gem 'redis-rails'

#authentication
gem 'devise'
gem 'bcrypt'
#Use Mongo DB
gem 'mongoid', '~> 7.0.5'
gem 'mongoid_search'
#Paypal IPN
gem 'paypal-sdk-rest', '~> 1.7.4'
gem "braintree"
gem "slack-ruby-client"
gem 'google-api-client', require: ['google/apis/drive_v3', 'google/apis/sheets_v4']
gem 'mini_magick'

gem 'rest-client'
gem 'git'
gem 'open_api-rswag-api'
gem 'open_api-rswag-ui'

# PDF generation
gem 'wicked_pdf', '~> 2.0.0'
gem 'wkhtmltopdf-binary'

group :development do
  # Spring speeds up development by keeping your application running in the background.
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

group :test do
  gem 'rspec-rails', '~> 4.0.0'
  gem 'mongoid-rspec'
  gem 'database_cleaner'
  gem 'rails-controller-testing'
  gem 'simplecov'
  gem 'open_api-rswag-specs'
end

group :development, :test do
  gem 'byebug', platform: :mri
  gem 'factory_bot_rails'
  gem 'rswag-specs'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

gem "honeybadger", "~> 5.28"
