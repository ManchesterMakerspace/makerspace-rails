class Card
  include Mongoid::Document
  field :uid #Member's CardID as string
  field :holder, type: String #Member's name
  field :expiry, type: Integer #Member's expirationTime
  field :validity, type: String #Member's Status
  attr_accessor :card_location

  before_create :set_expiration
  before_update :set_expiration
  # after_save :check_validity

  belongs_to :member, primary_key: "fullname", foreign_key: "holder"

  def set_expiration
    self.expiry = self.member.expirationTime
    if (!!self.card_location)
      self.validity = self.card_location
    elsif (self.validity != 'lost' && self.validity != 'stolen')
      if (self.member.membership_status != 'expired')
        self.validity = self.member.status
      else
        self.validity = 'expired'
      end
    end
  end

  # def check_validity
  #   Card.skip_callback(:save, :after, :check_validity)
  #
  #   self.save
  #   Card.set_callback(:save, :after, :check_validity)
  # end
end
