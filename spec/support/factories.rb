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
