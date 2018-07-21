class PaypalService::BillingPlan < PayPal::SDK::REST::Plan
  extend PaypalService
  @@rest_service = "Plan"

  def self.create_membership_plan(type)
    self.new(@@membership_plans[type.to_sym]).create
  end

  def self.create_custom_plan(plan)
    complete_plan = self.merge_plan(@@default_plan, plan)
    self.new(complete_plan).create
  end

  def self.merge_plan(base, target)
    merged_payment_definitions = merge_payment_definitions(base, target)
    result = base.deep_merge(target)
    result[:payment_definitions] = merged_payment_definitions
    result
  end

  # payment_definitions is one item array for whatever reason.
  # deep_merge doesn't handle arrays so do it ourself
  def self.merge_payment_definitions(base, target)
    (base[:payment_definitions].first || []).deep_merge(target[:payment_definitions].first || [])
  end

  def self.get_all_by_status(status)
    self.api_service.all({ status: status })
  end

  # Membership Pricing Constants
  @@ssm_discount = 0.9
  @@membership_price = {
    month: 65,
    quarter: 190,
    biannual: 380,
    annual: 765
  }
  @@default_plan = {
    type: "INFINITE",
    payment_definitions: [
      {
        name: "Standard",
        type: :REGULAR,
        frequency: "MONTH",
        frequency_interval: 1,
        cycles: 0, #0 means infinite here
        amount: {
          currency: "USD"
        }
      }
    ],
    merchant_preferences: {
      auto_bill_amount: "YES",
      return_url: "https://foobar.com",
      cancel_url: "https://foobar.com/cancel"
    }
  }
  @@membership_plans = {
    test: self.merge_plan(@@default_plan,
      {
        name: "Test Billing Plan",
        description: "Testing Billing Plan",
        type: "FIXED",
        payment_definitions: [
          {
            name: "Test",
            cycles: 1,
            amount: {
              value: 0.01,
            }
          }
        ],
      }
    ),
    standard: {
      monthly: self.merge_plan(@@default_plan,
        {
          name: "Monthly Recurring",
          description: "Membership subscription renewing monthly",
          payment_definitions: [
            {
              amount: {
                value: @@membership_price[:month],
              }
            }
          ],
        }
      ),
      quarterly: self.merge_plan(@@default_plan,
        {
          name: "Quarterly Recurring",
          description: "Membership subscription renewing quarterly",
          payment_definitions: [
            {
              frequency_interval: 3,
              amount: {
                value: @@membership_price[:quarter],
              }
            }
          ],
        }
      ),
      biannually: self.merge_plan(@@default_plan,
        {
          name: "Biannually Recurring",
          description: "Membership subscription renewing biannually",
          payment_definitions: [
            {
              frequency_interval: 6,
              amount: {
                value: @@membership_price[:biannual],
              }
            }
          ],
        }
      ),
      annually: self.merge_plan(@@default_plan,
        {
          name: "Annually Recurring",
          description: "Membership subscription renewing annually",
          payment_definitions: [
            {
              frequency_interval: 1,
              frequency: "YEAR",
              amount: {
                value: @@membership_price[:annual],
              }
            }
          ],
        }
      )
    }
  }

end
