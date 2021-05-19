source 'https://rubygems.org'
ruby '2.6.6'

gem 'rails', '~> 5.2.2'
gem 'rack-cors'
gem 'puma', '~> 4.3'
gem 'active_model_serializers'
gem 'dotenv-rails'

# Redis Cache and Event Bus
gem 'redis'
gem 'redis-rails'

#authentication
gem 'devise'
gem 'bcrypt'
#Use Mongo DB
gem 'mongoid', '~> 7.0.2'
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
gem 'wicked_pdf'
gem 'wkhtmltopdf-binary'

group :development do
  # Spring speeds up development by keeping your application running in the background.
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

group :test do
  gem 'rspec-rails'
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

# Frontend
gem "makerspace-react-rails", "1.0.8"
