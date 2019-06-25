require 'factory_bot'
Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

class SeedData
  include FactoryBot::Syntax::Methods

  def call
    create_permissions
    create_members
    create_rentals
    create_payments
    create_group
    create_rejection_cards
    create_invoice_options
  end

  private
  def create_members
    create_expired_members
    create_admins
    100.times do |n|
      create(:member,
        email: "basic_member#{n}@test.com",
        firstname: "Basic",
        lastname: "Member#{n}"
      )
    end
  end

  def create_expired_members
    20.times do |n|
      create(:member, :expired,
        email: "expired_memebr#{n}@test.com",
        firstname: "Expired",
        lastname: "Member#{n}"
      )
    end
  end

  def create_admins
    5.times do |n|
      create(:member, :admin,
        email: "admin_member#{n}@test.com",
        firstname: "Admin",
        lastname: "Member#{n}"
      )
    end
  end

  def create_rentals
    20.times do |n|
       create(:rental,
        member: Member.all[n]
      )
    end
  end

  def create_payments
    10.times { create(:payment) }
  end

  def create_group
    create(:group, member: Member.where(email: 'admin_member0@test.com').first)
  end

  def create_rejection_cards
    create(:rejection_card, uid: '0000')
    create(:rejection_card, uid: '0001')
    create(:rejection_card, uid: '0002')
  end

  def create_invoice_options
    create(:invoice_option, name: "One Month", amount: 65.0, id: "one-month", plan_id: "monthly_membership_subscription")
    create(:invoice_option, name: "Three Months", amount: 200.0, id: "three-months")
    create(:invoice_option, name: "One Year", amount: 800.0, id: "one-year")
  end

  def create_permissions
    DefaultPermission.create(name: :billing, enabled: true)
    DefaultPermission.create(name: :custom_billing, enabled: false)
    DefaultPermission.create(name: :earned_membership, enabled: true)
  end
end
