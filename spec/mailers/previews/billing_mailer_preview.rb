class BillingMailerPreview < ActionMailer::Preview
  def new_subscription
    member = Member.last || FactoryBot.create(:member)
    subscription = FactoryBot.build(:subscription,
      resource_class: "member",
      resource_id: member.id,
      member: member)
    invoice = member.invoices.last || FactoryBot.create(:invoice,
      subscription_id: subscription.id,
      resource_id: member.id,
      resource_class: "member",
      member: member)
    payment_method = FactoryBot.build(:credit_card)
    member.subscription_id = subscription.id

    BillingMailer._new_subscription(
      member,
      subscription,
      invoice,
      payment_method
    )
  end

  def subscription_receipt
    member = Member.last || FactoryBot.create(:member)
    subscription = FactoryBot.build(:subscription,
      resource_class: "member",
      resource_id: member.id,
      member: member)
    member.subscription_id = subscription.id
    invoice = member.invoices.last || FactoryBot.create(:invoice,
            subscription_id: subscription.id,
            resource_id: member.id,
            resource_class: "member",
            member: member)
    transaction = FactoryBot.build(:subscription_transaction)
    payment_method = FactoryBot.build(:credit_card)

    BillingMailer._receipt(
      member,
      transaction,
      invoice,
      subscription,
      payment_method
    )
  end

  def single_cc_transaction_receipt
    member = Member.last || FactoryBot.create(:member)
    invoice = member.invoices.last || FactoryBot.create(:invoice,
            resource_id: member.id,
            resource_class: "member",
            member: member)
    transaction = FactoryBot.build(:credit_card_transaction)
    payment_method = FactoryBot.build(:credit_card)

    BillingMailer._receipt(
      member,
      transaction,
      invoice,
      nil,
      payment_method
    )
  end

  def single_paypal_transaction_receipt
    member = Member.last || FactoryBot.create(:member)
    invoice = member.invoices.last || FactoryBot.create(:invoice,
            resource_id: member.id,
            resource_class: "member",
            member: member)
    transaction = FactoryBot.build(:paypal_transaction)
    payment_method = FactoryBot.build(:paypal_account)
s
    BillingMailer._receipt(
      member,
      transaction,
      invoice,
      nil,
      payment_method
    )
  end

  def refund
    member = Member.last || FactoryBot.create(:member)
    invoice = member.invoices.last || FactoryBot.create(:invoice,
            resource_id: member.id,
            resource_class: "member",
            member: member)
    subscription = FactoryBot.build(:subscription,
            resource_class: "member",
            resource_id: member.id,
            member: member)
    member.subscription_id = subscription.id
    transaction = FactoryBot.build(:credit_card_transaction)
    payment_method = FactoryBot.build(:paypal_account)

    BillingMailer._refund(
      member,
      transaction,
      invoice,
      subscription,
      payment_method
    )
  end

  def refund_requested
    member = Member.last || FactoryBot.create(:member)
    invoice = member.invoices.last || FactoryBot.create(:invoice,
            resource_id: member.id,
            resource_class: "member",
            member: member)
    subscription = FactoryBot.build(:subscription,
            resource_class: "member",
            resource_id: member.id,
            member: member)
    member.subscription_id = subscription.id
    transaction = FactoryBot.build(:credit_card_transaction)
    payment_method = FactoryBot.build(:paypal_account)

    BillingMailer._refund_requested(
      member,
      transaction,
      invoice,
      subscription,
      payment_method
    )
  end
end