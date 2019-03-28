class BillingMailerPreview < ActionMailer::Preview
  def new_subscription
    member = FactoryBot.build(:member)
    subscription = FactoryBot.build(:subscription,
      resource_class: "member",
      resource_id: member.id,
      member: member)
    member.subscription_id = subscription.id

    BillingMailer.new_subscription(
      member.email,
      subscription,
      FactoryBot.build(:invoice,
        subscription_id: subscription.id,
        resource_id: member.id,
        resource_class: "member",
        member: member)
    )
  end

  def subscription_receipt
    member = FactoryBot.build(:member)
    subscription = FactoryBot.build(:subscription,
      resource_class: "member",
      resource_id: member.id,
      member: member)
    member.subscription_id = subscription.id
    invoice = FactoryBot.build(:invoice,
            subscription_id: subscription.id,
            resource_id: member.id,
            resource_class: "member",
            member: member)

    BillingMailer.receipt(
      member.email,
      FactoryBot.build(:transaction),
      invoice
    )
  end

  def single_transaction_receipt
    member = FactoryBot.build(:member)
    invoice = FactoryBot.build(:invoice,
            resource_id: member.id,
            resource_class: "member",
            member: member)

    BillingMailer.receipt(
      member.email,
      FactoryBot.build(:transaction),
      invoice
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

  def admin_refund_requested
    BillingMailer.admin_refund_requested(
      FactoryBot.build(:member).email,
      FactoryBot.build(:transaction)
    )
  end
end