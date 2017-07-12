class Card
  include Mongoid::Document
  field :uid #Member's CardID as string
  field :holder, type: String #Member's name
  field :expiry, type: Integer #Member's expirationTime
  field :validity, type: String #Member's Status
  attr_accessor :card_location

  before_create :load_member_attribtues
  before_update :load_member_attribtues
  after_save :check_validity

  belongs_to :member

  def load_member_attribtues
    self.holder = self.member.fullname
    self.member_id = self.member.id.to_s
    self.expiry = self.member.expirationTime
  end

  def check_validity
    Card.skip_callback(:save, :after, :check_validity)
    if (!!self.card_location)
      self.validity = self.card_location
    elsif (self.validity != 'lost' && self.validity != 'stolen')
      if (self.member.membership_status != 'expired')
        self.validity = self.member.status
      else
        self.validity = 'expired'
      end
    end
    self.save
    Card.set_callback(:save, :after, :check_validity)
  end
end
