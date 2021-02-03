PayPal::SDK.load("#{__dir__}/../paypal.yml",  ENV['RACK_ENV'] || 'development')
PayPal::SDK.logger = Rails.logger
