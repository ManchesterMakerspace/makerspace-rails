class PaypalService::Payment
  include PaypalService

  def self.all
    return self.api.all
  end
end
