class BillingMailerPreview < ActionMailer::Preview
  def new_subscription
    BillingMailer.new_subscription(
      FactoryBot.build(:member).email,
      FactoryBot.build(:subscription)
    )
  end

  def receipt
    BillingMailer.receipt(
      FactoryBot.build(:member).email,
      FactoryBot.build(:transaction)
    )
  end

  def refund
    BillingMailer.refund(
      FactoryBot.build(:member).email,
      FactoryBot.build(:transaction)
    )
  end

  def refund_requested
    BillingMailer.refund_requested(
      FactoryBot.build(:member).email,
      FactoryBot.build(:transaction)
    )
  end
end