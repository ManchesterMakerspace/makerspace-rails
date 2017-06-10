class Card
  include Mongoid::Document
  field :uid #Member's CardID as string
  field :holder, type: String #Member's name
  field :expiry, type: Integer #Member's expirationTime
  field :validity, type: String #Member's Status
  attr_accessor :card_location

  before_create :load_member_attribtues
  before_update :update_member_attributes
  after_save :check_validity, if: :card_location

  belongs_to :member

  def load_member_attribtues
    self.holder = self.member.fullname
    self.member_id = self.member.id.to_s
    self.expiry = self.member.expirationTime
    self.validity = self.check_validity;
  end

  def update_member_attributes
    self.holder = self.member.fullname
    self.member_id = self.member.id.to_s
    self.expiry = self.member.expirationTime
  end

  def check_validity
    if (!!self.card_location)
      self.validity = self.card_location
      self.card_location = nil
      self.save
    else (self.member.status == 'activeMember' || self.member.status == 'nonMember' || self.member.status == 'revoked')
      if (self.member.membership_status != 'expired')
        self.validity = self.member.status
      else
        self.validity = 'expired'
      end
    end
  end
end
