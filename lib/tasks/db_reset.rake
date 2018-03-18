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

  task :reject_card => :environment do
    return unless Rails.env.test?
    last_card = RejectionCard.all.last
    new_uid = "%04d" % (last_card.uid.to_i + 1)
    FactoryBot.create(:rejection_card, uid: "#{new_uid}" || "0001" )
  end
end
