class BillingMailerPreview < ActionMailer::Preview
  def new_subscription
    member = FactoryBot.build(:member)
    subscription = FactoryBot.build(:subscription,
      resource_class: "member",
      resource_id: member.id,
      member: member)
    invoice = FactoryBot.build(:invoice,
      subscription_id: subscription.id,
      resource_id: member.id,
      resource_class: "member",
      member: member)
    payment_method = FactoryBot.build(:credit_card)
    member.subscription_id = subscription.id

    BillingMailer.new_subscription(
      member.email,
      subscription.id,
      invoice.id,
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
    transaction = FactoryBot.build(:subscription_transaction)

    BillingMailer.receipt(
      member.email,
      transaction.id,
      invoice.id
    )
  end

  def single_cc_transaction_receipt
    member = FactoryBot.build(:member)
    invoice = FactoryBot.build(:invoice,
            resource_id: member.id,
            resource_class: "member",
            member: member)
    transaction = FactoryBot.build(:credit_card_transaction)

    BillingMailer.receipt(
      member.email,
      transaction.id,
      invoice.id
    )
  end

  def single_paypal_transaction_receipt
    member = FactoryBot.build(:member)
    invoice = FactoryBot.build(:invoice,
            resource_id: member.id,
            resource_class: "member",
            member: member)
    transaction = FactoryBot.build(:paypal_transaction)

    BillingMailer.receipt(
      member.email,
      transaction.id,
      invoice.id
    )
  end

  def refund
    member = FactoryBot.build(:member)
    invoice = FactoryBot.build(:invoice,
            resource_id: member.id,
            resource_class: "member",
            member: member)
    transaction = FactoryBot.build(:credit_card_transaction)

    BillingMailer.refund(
      member.email,
      transaction.id,
      invoice.id
    )
  end

  def refund_requested
    member = FactoryBot.build(:member)
    invoice = FactoryBot.build(:invoice,
            resource_id: member.id,
            resource_class: "member",
            member: member)
    transaction = FactoryBot.build(:credit_card_transaction)

    BillingMailer.refund_requested(
      member.email,
      transaction.id,
      invoice.id
    )
  end
end