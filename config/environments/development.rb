Rails.application.configure do

  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = true

  # Show full error reports.
  config.consider_all_requests_local = true

  config.cache_store = :redis_store, {
    expires_in: 1.hour,
    namespace: 'cache',
    redis: { host: ENV['REDIS_URL'], port: ENV['REDIS_PORT'], db: ENV['REDIS_DB'] }
  }

  # # Enable/disable caching. By default caching is disabled.
  # if Rails.root.join('tmp/caching-dev.txt').exist?
  #   config.action_controller.perform_caching = true

  #   config.cache_store = :memory_store
  #   config.public_file_server.headers = {
  #     'Cache-Control' => 'public, max-age=172800'
  #   }
  # else
  #   config.action_controller.perform_caching = false

  #   config.cache_store = :null_store
  # end

  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.default_url_options = { host: "http://#{ENV["APP_DOMAIN"] || "localhost"}", port: ENV["PORT"] || 3002 }
  config.action_mailer.perform_caching = false
  config.action_controller.asset_host = "#{config.action_mailer.default_url_options[:host]}:#{config.action_mailer.default_url_options[:port]}"
  config.action_mailer.asset_host = config.action_controller.asset_host

  if ENV['MAILTRAP_API_TOKEN']
    config.action_mailer.perform_deliveries = true
    response = RestClient::Resource.new("https://mailtrap.io/api/v1/inboxes.json?api_token=#{ENV['MAILTRAP_API_TOKEN']}").get
    inbox = JSON.parse(response)[0]
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      :user_name => inbox['username'],
      :password => inbox['password'],
      :address => inbox['domain'],
      :domain => inbox['domain'],
      :port => 2525,
      :authentication => :plain
    }
  end
  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations.
  # config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Suppress logger output for asset requests.
  config.assets.quiet = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  config.file_watcher = ActiveSupport::EventedFileUpdateChecker

  
end
