require 'bcrypt'
require 'securerandom'
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
    encrypted_password BCrypt::Password.create('password')
    memberContractOnFile true

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
  end

  factory :card do
    transient do
      lost false
      stolen false
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
    validity :unregistered
  end

  factory :payment do
    product "1-month Subscription Sub-Stnd-Membership"
    firstname "firstname"
    lastname "lastname"
    amount 65.0
    currency "USD"
    payer_email { generate(:email)}

    trait :sub_payment do
      txn_type "subscr_payment"
    end
    trait :sub_cancel do
      txn_type "subscr_cancel"
    end
    trait :subscr_failed do
      txn_type "subscr_failed"
    end
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
