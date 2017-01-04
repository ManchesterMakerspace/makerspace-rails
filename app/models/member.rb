class Member
    include Mongoid::Document

    validates :fullname, :cardID, presence: true, uniqueness: true
    validates :status, presence: true

    field :fullname #full name of user
    field :cardID # user card id
    field :status # current, revoked
    field :accesspoints, type: Array #points of access member (door, machine, etc)
    field :expirationTime, type: Integer #pre-calcualted time of expiration
    field :groupName #potentially member is in a group/partner membership
    field :groupKeystone, type: Boolean
    field :role #admin,officer,member
    field :email #email address
    field :password #admin cards only


    has_and_belongs_to_many :workshops, class_name: 'Workshop', inverse_of: nil
    has_and_belongs_to_many :learned_skills, class_name: 'Skill', inverse_of: :allowed_members

    def self.search_terms
      ['id','name','email']
    end

    def allowed_workshops
      allowed = Workshop.all.collect { |workshop| workshop.skills.all? { |skill| self.learned_skills.include?(skill) } ? workshop : nil}.compact.uniq
      allowed << Workshop.all.select { |shop| shop.officer == self}
      allowed.flatten.uniq.sort_by(&:name)
    end

    def membership_status
      if duration <= 0
        'expired'
      elsif duration < 1.week
        'expiring'
      else
        'current'
      end
    end

    def revoke
      write_attribute(:status, 'Revoked')
      self.save
    end

    def restore
      write_attribute(:status, 'Current')
      self.save
    end

    def membership_mailer
      if status != 'Group' #Group membership expiration  dates are not accurate and should not be parsed
        if duration == 0
          MemberMailer.expired_member_notification(self).deliver_now
        elsif membership_status == 'expiring'
          MemberMailer.expiring_member_notification(self).deliver_now
        end
      end
    end

    def expirationTime
      Time.at(read_attribute(:expirationTime).to_i / 1000)
    end

    def duration
      expirationTime - Time.now
    end

    def expirationTime=(num_months)
      if expirationTime.to_i > 0
        write_attribute(:expirationTime, (expirationTime.strftime('%s').to_i * 1000) + (num_months.to_i*30*24*60*60*1000))
      else
        write_attribute(:expirationTime, (Time.now.strftime('%s').to_i * 1000) + (num_months.to_i*30*24*60*60*1000))
      end
      self.save
    end
end
