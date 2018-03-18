require 'database_cleaner'
require 'factory_bot'
Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

namespace :db do
  desc "Clears the db for testing."
  task :db_reset => :environment do
    return unless Rails.env.test?
    DatabaseCleaner.strategy = :truncation
    DatabaseCleaner.clean
    SeedData.new.call
  end
end
