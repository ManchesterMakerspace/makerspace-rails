require 'bcrypt'
require 'securerandom'
require_relative '../../lib/service/braintree_gateway'
# the factories here lists the default values. these can all be overridden.
# sequence creates unique sequenced values for different attributes.
today = Time.now
expired_time = (today - 20.days).to_i * 1000
valid_time = (today + 20.days).to_i * 1000
expiring_time = (today + 5.days).to_i * 1000

# member related factory
FactoryBot.define do
  factory :member do
    firstname {generate(:firstname)}
    lastname {generate(:lastname)}
    cardID {generate(:cardID)}
    expirationTime {generate(:expiry)}
    email {generate(:email)}
    encrypted_password { BCrypt::Password.create('password') }
    memberContractOnFile { true }
    status { 'activeMember' }

    trait :expired do
      after(:build) do |member|
        member.expirationTime = expired_time
      end
    end
    trait :expiring do
      after(:build) do |member|
        member.expirationTime = expiring_time
      end
    end
    trait :current do
      after(:build) do |member|
        member.expirationTime = valid_time
      end
    end
    trait :admin do
      after(:build) do |member|
        member.role = 'admin'
      end
    end
    trait :inactive do
      after(:build) do |member|
        member.status = 'inactive'
      end
    end
    trait :revoked do
      after(:build) do |member|
        member.status = 'revoked'
      end
    end
  end

  factory :earned_member, parent: :member do
    association :earned_membership
  end

  factory :card do
    transient do
      lost { false }
      stolen { false }
    end

    association :member
    uid {generate(:uid)}
    after(:create) do |validity, evaluator|
      card.validity = 'lost' if evaluator.lost
      card.validity = 'stolen' if evaluator.stolen
    end
  end

  factory :rental do
    number { generate(:number)}
    expiration { generate(:expiry) }
  end

  factory :registration_token do
    email {generate(:email)}
  end

  factory :group do
    member
    active_members { build_list :member, 5 }
    groupName { generate(:group_name) }
    expiry { generate(:expiry) }
  end

  factory :rejection_card do
    uid { generate(:cardID) }
    timeOf { generate(:time_of) }
    validity { :unregistered }
  end

  factory :payment do
    product { "1-month Subscription Sub-Stnd-Membership" }
    firstname { "firstname" }
    lastname { "lastname" }
    amount { 65.0 }
    currency { "USD" }
    payer_email { generate(:email)}
    txn_id { generate(:uid) }

    trait :sub_payment do
      txn_type { "subscr_payment" }
    end
    trait :sub_cancel do
      txn_type { "subscr_cancel" }
    end
    trait :subscr_failed do
      txn_type { "subscr_failed" }
    end
    trait :rental_sub do
      product { "Plot Rental" }
      txn_type { "subscr_payment" }
    end
  end

  factory :default_permission do
    name { generate(:number) }
    enabled {false}

    trait :enabled do
      after(:build) do |permission|
        permission.enabled = true
      end
    end
  end

  factory :permission do
    name { generate(:number) }
    enabled {false}
    association :member

    trait :enabled do
      after(:build) do |permission|
        permission.enabled = true
      end
    end
  end

  factory :earned_membership do
    association :member
    after(:build) do |earned_membership|
      FactoryBot.create_list(:requirement, 2, earned_membership: earned_membership)
    end
  end

  factory :earned_membership_no_requirements, class: EarnedMembership do
    association :member
  end

  factory :earned_membership_with_reports, :parent => :earned_membership do
    after(:build) do |earned_membership|
      FactoryBot.create_list(:report_with_report_requirements, 2, earned_membership: earned_membership)
    end
  end

  factory :requirement, class: EarnedMembership::Requirement do
    association :earned_membership
    name { generate(:uid) }
    rollover_limit { 0 }
    target_count { generate(:number).to_i }
    strict { false }
    term_length { 1 }
  end

  factory :report, class: EarnedMembership::Report do
    association :earned_membership
    date { generate(:expiry) }
  end

  factory :report_with_report_requirements, parent: :report do
    after(:build) do |report|
      report.report_requirements = report.earned_membership.requirements.map do |req|
        create(:report_requirement, requirement: req, report: report, term: req.current_term)
      end
    end
  end

  factory :report_requirement, class: EarnedMembership::ReportRequirement do
    association :requirement
  end

  factory :report_requirement_with_term, parent: :report_requirement do
    association :term
  end

  factory :term, class: EarnedMembership::Term do
    association :requirement
    satisfied { false }
  end

  factory :invoice do
    association :member, strategy: :create
    name { "Some invoice" }
    description { "An invoice to pay or that's been paid"}
    due_date { Time.now + 1.month }
    amount { 65.00 }
    quantity { 1 }
    operation { "renew=" }
    resource_class { "member" }

    after(:build) do |invoice|
      invoice.resource_id ||= invoice.member.id
    end
  end

  factory :settled_invoice, parent: :invoice do 
    settled_at { Time.now }
  end 

  factory :invoice_option do
    name { "Some invoice" }
    description { "An invoice to pay or that's been paid"}
    resource_class { "member" }
    operation { "renew=" }
    amount { 65.00 }
    quantity { 1 }
    disabled { false }
  end

  factory :transaction, class: ::BraintreeService::Transaction  do
    id { "4t606y71" }
    status { ::Braintree::Transaction::Status::Settled }
    amount { "65.00" }
    created_at { Time.now.to_s }
    recurring { false }
    line_items {[
      {
        kind: "debit",
        name: "Payment for something",
        quantity: 1,
        total_amount: 65.00,
        unit_amount: 65.00,
        transaction_id: "1234"
      }
    ]}

    initialize_with { new(braintree_gateway, attributes) }
  end

  factory :paypal_transaction, parent: :transaction do
    payment_instrument_type { :paypal_account }
    paypal {({
      payer_email: "foo@test_makerspace.com"
    })}
  end

  factory :credit_card_transaction, parent: :transaction do
    payment_instrument_type { :credit_card }
    credit_card {({
      card_type: ::Braintree::CreditCard::CardType::Visa,
      expiration_month: 10,
      expiration_year: 2020,
      expiration_date: 25,
      last_4: 1234,
      token: "g7291",
    })}
  end

  factory :subscription_transaction, parent: :transaction do
    recurring { true }
    subscription {{
      billing_period_end_date: Time.now + 1.month.to_s,
      billing_period_start_date: Time.now.to_s,
    }}
    subscription_id { generate(:uid) }
    payment_instrument_type { :credit_card }
    credit_card {({
      card_type: ::Braintree::CreditCard::CardType::Visa,
      expiration_month: 10,
      expiration_year: 2020,
      expiration_date: 25,
      last_4: 1234,
      token: "g7291",
    })}
    
  end

  factory :refunded_transaction, parent: :transaction do
    refund_ids {[ generate(:uid) ]}
    refunded_transaction_id { generate(:uid) }
  end

  factory :subscription, class: ::BraintreeService::Subscription do
    id { "member_1234" }
    status { ::Braintree::Subscription::Status::Active }
    price { "65.00" }
    first_billing_date { Time.now }
    next_billing_date { Time.now + 1.month }
    transactions { [] }
    add_ons { [] }
    discounts { [] }

    initialize_with { new(braintree_gateway, attributes) }
  end

  factory :plan, class: ::BraintreeService::Plan do
    name { "A Billing Plan" }
    description { "A billing plan to charge custoemrs" }
    price { "65.00" }
    billing_frequency { 1 }
    add_ons { [] }
    discounts { [] }

    initialize_with { new(braintree_gateway, attributes) }
  end

  factory :credit_card, class: ::BraintreeService::CreditCard do
    card_type { ::Braintree::CreditCard::CardType::Visa }
    expiration_month { 10 }
    expiration_year { 2020 }
    expiration_date { 25 }
    last_4 { 1234 }
    token { "g7291" }

    initialize_with { new(braintree_gateway, attributes) }
  end

  factory :paypal_account, class: ::BraintreeService::PaypalAccount do
    email { generate(:email) }
    token { "g7291" }

    initialize_with { new(braintree_gateway, attributes) }
  end

  factory :discount, class: ::BraintreeService::Discount do
    name { "10% Discount" }
    description { "A discount for 10%" }
    amount { 6.50 }

    initialize_with { new(attributes) }
  end

  factory :dispute, class: ::BraintreeService::Dispute do 
    amount_disputed { "60" }
    amount { "60" }
    amount_won { "0" }
    received_date { Time.now.strftime("%d - %m - %Y") }
    initialize_with { new(attributes) }
  end

  factory :notification, class: ::BraintreeService::Notification do 
    kind { Braintree::WebhookNotification::Kind::SubscriptionChargedSuccessfully }
    timestamp { Time.now }
    payload { JSON.generate(build(:subscription)) }
  end

  factory :dispute_notification, parent: :notification do 
    kind { Braintree::WebhookNotification::Kind::DisputeOpened }
    payload { JSON.generate(build(:dispute)) }
  end

  sequence :time_of do |n|
    (Time.now - n.days).to_i * 1000
  end

  sequence :uid do |n|
    "#{SecureRandom.uuid}"
  end

  sequence :number do |n|
    "#{n}"
  end

  sequence :cardID do |n|
    "#{SecureRandom.hex(5)}"
  end

  sequence :email do |n|
    "user_#{n}@example.com"
  end

  sequence :firstname do |n|
    "first_name#{n}"
  end

  sequence :lastname do |n|
    "last_name#{n}"
  end

  sequence :group_name do |n|
    "Fake Group #{n}"
  end

  sequence :expiry do |n|
    (Time.now + n.months).to_i * 1000
  end
end

def braintree_gateway
  Braintree::Gateway.new(
      :environment => ENV["BT_ENV"].to_sym,
      :merchant_id => ENV["BT_MERCHANT_ID"],
      :public_key => ENV["BT_PUBLIC_KEY"],
      :private_key => ENV['BT_PRIVATE_KEY'],
    )
end