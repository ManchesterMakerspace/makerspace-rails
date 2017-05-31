class Card
  include Mongoid::Document
  field :uid #Member's CardID
  field :holder, type: String #Member's name
  field :expiry, type: Integer #Member's expirationTime
  field :validity, type: String #
  attr_accessor :card_location

  before_save :load_member_attribtues

  belongs_to :member

  def load_member_attribtues
    self.holder = self.member.fullname
    self.memberID = self.member.id.to_s
    self.expiry = self.member.expirationTime
    self.validity = self.check_validity
  end

  def check_validity
    if (!!self.card_location)
      self.validity = self.card_location
    else (self.member.status == 'activeMember' || self.member.status == 'nonMember' || self.member.status == 'revoked')
      if (self.member.membership_status != 'expired')
        self.validity = self.member.status
      else
        self.validity = 'expired'
      end
    end
  end
end
