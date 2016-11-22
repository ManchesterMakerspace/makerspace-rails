class Member
    include Mongoid::Document
    store_in collection: "members", database: "makerauth", client: 'default'

    validates :fullname, :cardID, presence: true, uniqueness: true
    validates :status, presence: true

    field :fullname #full name of user
    field :cardID # user card id
    field :status # type of account, admin, mod, ect
    field :accesspoints, type: Array #points of access member (door, machine, etc)
    field :expirationTime, type: Integer #pre-calcualted time of expiration
    field :groupName #potentially member is in a group/partner membership
    field :groupKeystone, type: Boolean
    field :groupSize, type: Integer #how many memebrs in group
    field :password #admin cards only

    def membership_status
      if duration <= 0
        'expired'
      elsif duration < 1.week
        'expiring'
      else
        'current'
      end
    end

    def membership_mailer
      if status != 'Group' #Group membership expiration  dates are not accurate and should not be parsed
        if duration = 0
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
    end
end
