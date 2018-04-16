source 'https://rubygems.org'

gem 'rails_12factor', group: :production
gem 'rails', '~> 5.0.0', '>= 5.0.0.1'
gem 'puma', '~> 3.0'
gem 'sass-rails', '~> 5.0'
gem 'active_model_serializers'
gem 'angular-rails-templates'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
gem 'dotenv-rails'

#authentication
gem 'devise'
gem 'bcrypt'
#Use Mongo DB
gem 'mongoid', '~> 6.0.0'
gem 'mongoid_search'
#Paypal IPN
gem 'paypal-sdk-merchant'
gem "slack-notifier"
gem 'google_drive'
gem 'socket.io-rails'
gem 'google-api-client', require: ['google/apis/calendar_v3', 'google/apis/drive_v3']
gem 'mini_magick'

group :development do
  gem 'byebug', platform: :mri
  # Spring speeds up development by keeping your application running in the background.
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

group :test do
  gem 'byebug', platform: :mri
  gem 'rspec-rails'
  gem 'mongoid-rspec'
  gem 'factory_bot'
  gem 'database_cleaner'
  gem 'shoulda-callback-matchers'
  gem 'rails-controller-testing'
  gem 'simplecov'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
