module Util
  def is_prod?
    self.class.is_prod?
  end

  def self.is_prod?
    Rails.env.production? && ENV['BT_ENV'].to_sym == :production
  end

  def self.date_as_string(maybe_date)
    string_date = maybe_date.kind_of?(String) ? maybe_date : maybe_date.strftime("%m/%d/%Y")
    Date.parse(string_date).strftime("%m/%d/%Y")
  end

  def date_as_string(maybe_date)
    self.class.date_as_string(maybe_date)
  end
end