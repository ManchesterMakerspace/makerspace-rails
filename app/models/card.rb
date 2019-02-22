class Card
  include Mongoid::Document
  field :uid #Member's CardID as string
  field :holder, type: String #Member's name
  field :expiry, type: Integer #Member's expirationTime
  field :validity, type: String #Member's Status
  attr_accessor :card_location

  before_create :set_expiration, :set_holder
  before_update :set_expiration
  after_create :update_rejection_card

  validates :uid, presence: true, uniqueness: true

  belongs_to :member, class_name: 'Member', inverse_of: :access_cards

  @@memberStatuses = {
    active: "activeMember",
    revoked: "revoked",
    nonMember: "nonMember",
    lost: "lost",
    stolen: "stolen",
    expired: "expired"
  }

  @@activeStatuses = [
    @@memberStatuses[:active],
    @@memberStatuses[:nonMember],
    @@memberStatuses[:expired],
  ]

  def is_active?
    @@activeStatuses.include?(self.validity)
  end

  def invalidate
    self.card_location = @@memberStatuses[:lost]
    self.save!
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

  def update_rejection_card
    rejection_card = RejectionCard.find_by(uid: self.uid)
    rejection_card.update_attributes!(holder: self.member.fullname) unless rejection_card.nil?
  end
end
