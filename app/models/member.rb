class Member
  include Mongoid::Document
  include Mongoid::Search
  include ActiveModel::Serializers::JSON

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  field :cardID

  #split first and last
  field :firstname
  field :lastname
  field :status,                         default: "activeMember" # activeMember, nonMember, revoked
  field :expirationTime,   type: Integer #pre-calcualted time of expiration
  field :startDate, default: Time.now
  field :groupName #potentially member is in a group/partner membership
  field :role,                          default: "member" #admin,officer,member
  field :memberContractOnFile, type: Boolean
  field :subscription,    type: Boolean,   default: false
  ## Database authenticatable
  field :email,              type: String, default: ""
  field :encrypted_password, type: String, default: ""
  ## Recoverable
  field :reset_password_token,   type: String
  field :reset_password_sent_at, type: Time
  ## Rememberable - Handles cookies
  field :remember_created_at, type: Time

  search_in :email, :lastname, :firstname

  validates :firstname, presence: true
  validates :lastname, presence: true
  validates :email, uniqueness: true
  validates :cardID, uniqueness: true
  validates_confirmation_of :password

  before_save :update_allowed_workshops
  after_initialize :verify_group_expiry
  after_update :update_card

  has_many :offices, class_name: 'Workshop', inverse_of: :officer
  has_many :access_cards, class_name: "Card", inverse_of: :member
  belongs_to :group, class_name: "Group", inverse_of: :active_members, optional: true, primary_key: 'groupName', foreign_key: "groupName"
  has_and_belongs_to_many :learned_skills, class_name: 'Skill', inverse_of: :trained_members
  has_and_belongs_to_many :expertises, class_name: 'Workshop', inverse_of: :experts
  has_and_belongs_to_many :allowed_workshops, class_name: 'Workshop', inverse_of: :allowed_members

  def self.active_members
    return Member.where(status: 'activeMember', :expirationTime.gt => (Time.now.strftime('%s').to_i * 1000))
  end

  def self.expiring_members
    return Member.where(status: 'activeMember', :expirationTime.gt => (Time.now.strftime('%s').to_i * 1000), :expirationTime.lte => (Time.now + 1.week).strftime('%s').to_i * 1000)
  end

  def self.search_members(searchTerms)
    regexp_search = Regexp.new(searchTerms, 'i')
    members = Member.where(email: searchTerms)
    members = Member.where("(this.firstname + ' ' + this.lastname).match(new RegExp('#{searchTerms}', 'i'))") unless (members.size > 0)
    members = Member.full_text_search(searchTerms, index: :_lastname_keywords).sort_by(&:relevance).reverse unless (members.size > 0)
    members = Member.full_text_search(searchTerms, index: :_email_keywords).sort_by(&:relevance).reverse unless (members.size > 0)
    return members
  end

  # Includes firstname if cant find anything else
  # Not to be used for Payment association
  def self.rough_search_members(searchTerms)
    members = self.search_members(searchTerms)
    memebrs = Member.full_text_search(searchTerms).sort_by(&:relevance).reverse unless (members.size > 0)
    return members
  end

  def fullname
    return "#{self.firstname} #{self.lastname}"
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
     if self.expirationTime
       return Time.at(self.expirationTime/1000)
     else
       return Time.at(0)
     end
   end

  def verify_group_expiry
    if self.group
      #make sure member benefits from group expTime
      if benefits_from_group
        self.expirationTime = self.group.expiry
      end
    end
  end

  def renewal=(num_months)
    now_in_ms = (Time.now.strftime('%s').to_i * 1000)

    if (!!self.expirationTime && self.try(:expirationTime) > now_in_ms && self.persisted?) #if renewing
      newExpTime = prettyTime + num_months.to_i.months
      write_attribute(:expirationTime, (newExpTime.to_i * 1000) )
    else
      newExpTime = Time.now + num_months.to_i.months
      write_attribute(:expirationTime,  (newExpTime.to_i * 1000) )
    end
    self.save
  end

  private
  def update_card
    self.access_cards.each do |c|
      c.update(expiry: self.expirationTime)
    end
  end

  def benefits_from_group
    return self.group.expiry &&
           self.expirationTime &&
           self.group.expiry > (Time.now.strftime('%s').to_i * 1000) &&
           self.group.expiry > self.expirationTime
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

  def duration
    prettyTime - Time.now
  end
end
