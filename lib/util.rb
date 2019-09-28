module Util
  def is_prod?
    self.class.is_prod?
  end

  def self.is_prod?
    Rails.env.production? && ENV['BT_ENV'].to_sym == :production
  end
end