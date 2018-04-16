require 'factory_bot'
Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

class SeedData
  include FactoryBot::Syntax::Methods

  def call
    create_members
    create_rentals
    create_payments
    create_group
    create_rejection_cards
  end

  private
  def create_members
    create_expired_members
    create_admins
    100.times do |n|
      create(:member,
        email: "basic_member_#{n}@test.com",
        fullname: "Basic Member#{n}"
      )
    end
  end

  def create_expired_members
    20.times do |n|
      create(:member, :expired,
        email: "expired_memebr_#{n}@test.com",
        fullname: "Expired Member#{n}"
      )
    end
  end

  def create_admins
    5.times do |n|
      create(:member, :admin,
        email: "admin_member_#{n}@test.com",
        fullname: "Admin Member#{n}"
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
    create(:group, member: Member.where(email: 'admin_member_0@test.com').first)
  end

  def create_rejection_cards
    create(:rejection_card, uid: '0000')
    create(:rejection_card, uid: '0001')
    create(:rejection_card, uid: '0002')
  end
end
