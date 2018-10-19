class Card
  include Mongoid::Document
  field :uid #Member's CardID as string
  field :holder, type: String #Member's name
  field :expiry, type: Integer #Member's expirationTime
  field :validity, type: String #Member's Status
  attr_accessor :card_location

  before_create :set_expiration, :set_holder
  before_update :set_expiration
  # after_save :check_validity

  validates :uid, presence: true, uniqueness: true

  belongs_to :member, class_name: 'Member', inverse_of: :access_cards

  @@memberStatuses = {
    active: "activeMember",
    revoked: "revoked",
    nonMember: "nonMember",
    lost: "lost",
    stoken: "stolen",
    expired: "expired"
  }

  @@activeStatuses = [
    @@memberStatuses[:active],
    @@memberStatuses[:nonMember],
    @@memberStatuses[:expired],
  ]

  def isActive
    @@activeStatuses.include?(self.validity)
  end

  private
  def set_holder
    self.holder = self.member.fullname
  end

  def set_expiration
    self.expiry = self.member.expirationTime
    if (!!self.card_location)
      self.validity = self.card_location
    elsif (self.validity != @@memberStatuses[:lost] && self.validity != @@memberStatuses[:stolen])
      self.validity = self.member.status
    end
  end
end
