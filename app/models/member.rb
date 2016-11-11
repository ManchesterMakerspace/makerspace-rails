class Member
    include Mongoid::Document
    store_in collection: "members", database: "makerauth", client: 'default'

    validates :fullname, :cardID, presence: true, uniqueness: true
    validates :status, presence: true

    field :fullname #full name of user
    field :cardID # user card id
    field :status # type of account, admin, mod, ect
    field :accesspoints, type: Array #points of access member (door, machine, etc)
    field :expirationTime #pre-calcualted time of expiration
    field :groupName #potentially member is in a group/partner membership
    field :groupKeystone, type: Boolean #holds expiration date for group
    field :groupSize, type: Integer #how many memebrs in group
    field :password #admin cards only

    def expTime
        ms = self.expirationTime.to_i.to_s[0,10]
        t = Time.at(ms.to_i)
        "#{t.mon}/#{t.day}/#{t.year}"
    end
end
