if ENV['RAILS_ENV'] == 'test'
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

    task :reject_card, [:number] => :environment do |t, args|
      return unless Rails.env.test?
      if args[:number].nil? then
        last_card = RejectionCard.all.last
        new_uid = last_card.nil? ? "0001" : ("%04d" % (last_card.uid.to_i + 1))
      else
        new_uid = args[:number]
      end
      FactoryBot.create(:rejection_card, uid: "#{new_uid}")
    end
  end
end
