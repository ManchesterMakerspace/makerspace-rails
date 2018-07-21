class PaypalService::Agreement < PayPal::SDK::REST::Agreement
  extend PaypalService
  @@rest_service = "Agreement"

  def self.create_test_agreement()
    plan = PaypalService::BillingPlan.get_all_by_status("ACTIVE").plans.last
    new_agreement = self.new(@@test.merge({ plan: plan }))
    new_agreement.create
    new_agreement
  end

  def create()
    path = "v1/payments/billing-agreements/"
    puts self.hashify
    puts self.to_hash
    response = api.post(path, self.hashify, http_header)
    self.merge!(response)
    self.get_token(self.links)
    success?
  end

  def hashify
    hash = self.to_hash
    hash["plan"] = { id: self.plan.id }
    hash.to_hash
  end

  @@test = {
    name: "Will Testing API",
    description: "Don't mind me.. just testing this new fangled API",
    start_date: (Time.new + 25.hours).iso8601,
    payer: {
      payment_method: :paypal
    }
  }
end

# EC-6D352393TB562750E
