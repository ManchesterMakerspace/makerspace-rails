class Member
  include Mongoid::Document
  include ActiveModel::Serializers::JSON
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  attr_accessor :cardID
  field :fullname #full name of user
  field :status,                         default: "activeMember" # activeMember, nonMember, revoked
  field :accesspoints,     type: Array,  default: [] #points of access member (door, machine, etc)
  field :expirationTime,   type: Integer #pre-calcualted time of expiration
  field :groupName #potentially member is in a group/partner membership
  field :groupKeystone,    type: Boolean
  field :role,                          default: "member" #admin,officer,member
  field :memberContractOnFile, type: Boolean
  field :slackHandle
  field :notificationAck, type: Boolean
  ## Database authenticatable
  field :email,              type: String, default: ""
  field :encrypted_password, type: String, default: ""
  ## Recoverable
  field :reset_password_token,   type: String
  field :reset_password_sent_at, type: Time
  ## Rememberable - Handles cookies
  field :remember_created_at, type: Time

  validates :fullname, presence: true, uniqueness: true
  before_save :update_allowed_workshops
  after_create :create_card

  has_many :offices, class_name: 'Workshop', inverse_of: :officer
  has_many :cards
  accepts_nested_attributes_for :cards
  has_many :groups
  has_and_belongs_to_many :learned_skills, class_name: 'Skill', inverse_of: :trained_members
  has_and_belongs_to_many :expertises, class_name: 'Workshop', inverse_of: :experts
  has_and_belongs_to_many :allowed_workshops, class_name: 'Workshop', inverse_of: :allowed_members

  def cards_attributes=(cards_attributes)
    cards_attributes.values.each do |card_attribute| #controller sends array of cards
      card = Card.find_by(id: BSON::ObjectId.from_string(card_attribute["id"])) #convert id attribute to BSON::ObjectId class before query
      if (!!card_attribute["card_location"])
        card.update(card_location: card_attribute["card_location"])
      end
    end
  end

  def create_card
    Card.create(uid: self.cardID, member: self)
  end

  def update_allowed_workshops #this checks to see if they have learned all the skills in a workshop one at a time
    allowed = Workshop.all.collect { |workshop| workshop.skills.all? { |skill| self.learned_skills.include?(skill) } ? workshop : nil}.compact.uniq
    allowed.flatten.uniq.each do |shop|
      allowed_workshops.include?(shop) ?  nil : (allowed_workshops << shop)
    end
  end

  def email_required?
    false
  end

  def password_required?
    false
  end

  def password_match?
    self.errors[:password] << "can't be blank" if password.blank?
    self.errors[:password_confirmation] << "can't be blank" if password_confirmation.blank?
    self.errors[:password_confirmation] << "does not match password" if password != password_confirmation
    password == password_confirmation && !password.blank?
  end

  def self.search_terms
    ['id','name','email']
  end

  def list_allowed_workshops
    allowed_workshops.pluck(:name).sort.join(", ")
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

  def prettyTime
    Time.at(expirationTime/1000)
  end

  def duration
    prettyTime - Time.now
  end

  def expirationTime=(time)
    num_months = time[:expTime]
    now_in_ms = (Time.now.strftime('%s').to_i * 1000)
    if (!!time[:startDate]) #check if startDate was passed to function.
      d = time[:startDate].split("/");
      start_date = (Time.new(d[2], d[0], d[1]))
    else #if not, use today.
      start_date = Time.now
    end

    if (!!self.expirationTime && self.try(:expirationTime) > now_in_ms && self.persisted?) #if renewing
      newExpTime = prettyTime + num_months.to_i.months
      write_attribute(:expirationTime, (newExpTime.to_i * 1000) )
    else
      newExpTime = start_date + num_months.to_i.months
      write_attribute(:expirationTime,  (newExpTime.to_i * 1000) )
    end
    self.save
  end

  def accesspoints=(point)
    !self.accesspoints.include?(point) ? self.accesspoints.push(point) : nil
  end
end
