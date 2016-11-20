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
    field :groupKeystone, type: Boolean #holds expiration date for group
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
        if membership_status == 'expired'
          MemberMailer.expired_member_notification(self).deliver_now
        elsif membership_status == 'expiring'
          MemberMailer.expiring_member_notification(self).deliver_now
        end
      end
    end

    def expirationTime
        Time.at(read_attribute(:expirationTime).to_s[0,10].to_i)
    end

    def duration
      expirationTime - Time.now
    end
end
