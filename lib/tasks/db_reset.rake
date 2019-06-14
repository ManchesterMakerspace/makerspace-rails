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

      # Collect extra arguments
      braintree_options = ARGV.drop(1)
                              .select { |argv| argv =~ /^[a-z]+$/ }
                              .map { |argv| argv.to_sym }

      if braintree_options.length
        gateway = ::Service::BraintreeGateway.connect_gateway
        cancel_subscriptions(gateway) if braintree_options.include?(:subscriptions)
        delete_payment_methods(gateway) if braintree_options.include?(:payment_methods)
      end

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

def cancel_subscriptions(gateway)
  subscriptions = ::BraintreeService::Subscription.get_subscriptions(gateway)
  results = subscriptions.map do |subscription|
    result = ::BraintreeService::Subscription.cancel(gateway, subscription.id)
  end
  evaluate_results(results)
end

def delete_payment_methods(gateway)
  customers = Member.where(:customer_id.nin => ["", nil])
  results = []

  customers.each do |customer|
    payment_methods = ::BraintreeService::PaymentMethod.get_payment_methods_for_customer(gateway, customer.customer_id)
    payment_methods.each do |payment_method|
      result = ::BraintreeService::PaymentMethod.delete_payment_method(gateway, payment_method.token)
      results.push(result)
    end
  end

  evaluate_results(results)
end

def evaluate_results(results)
  failures = results.select { |r| !r.success? }
  if failures.length > 0
    failures.each do |failure|
      failure.errors.each do |error|
        STDERR.puts error.attribute
        STDERR.puts error.code
        STDERR.puts error.message
      end
    end
  end
end
