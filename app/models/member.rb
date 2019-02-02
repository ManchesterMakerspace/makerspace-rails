class Member
  include Mongoid::Document
  include Mongoid::Search
  include ActiveModel::Serializers::JSON
  include InvoiceableResource
  include Service::BraintreeGateway

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  field :cardID

  #split first and last
  field :firstname
  field :lastname
  field :status,                         default: "activeMember" # activeMember, nonMember, revoked, inactive
  field :expirationTime,  type: Integer  #pre-calcualted time of expiration
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

  field :customer_id, type: String # Braintree customer relation
  field :subscription_id, type: String # Braintree relation

  search_in :email, :lastname, :firstname

  validates :firstname, presence: true
  validates :lastname, presence: true
  validates :email, uniqueness: true
  validates :cardID, uniqueness: true, allow_nil: true
  validates_inclusion_of :status, in: ["activeMember", "nonMember", "revoked", "inactive"]

  before_save :update_braintree_customer_info
  after_initialize :verify_group_expiry
  after_update :update_card

  has_many :rentals, class_name: 'Rental'
  has_many :access_cards, class_name: "Card", inverse_of: :member
  belongs_to :group, class_name: "Group", inverse_of: :active_members, optional: true, primary_key: 'groupName', foreign_key: "groupName"

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

  def find_subscription_resource(id)
    resource = self if self.subscription_id && self.subscription_id == id
    resource = (self.rentals && self.rentals.find_by(subscription_id: subscription_id)) if resource.nil?
    resource
  end

  def remove_subscription
    self.update!({ subscription_id: nil, subscription: false })
  end

  protected
  def find_braintree_customer
    gateway.customer.find(self.customer_id) unless self.customer_id.nil?
  end

  def update_braintree_customer_info
    if self.customer_id && self.changed.any? { |attr| [:firstname, :lastname].include?(attr) }
      gateway = self.connect_gateway
      customer = gateway.customer.update(self.customer_id, firstname: self.firstname, lastname: self.lastname)
    end
  end

  def expiration_attr
    :expirationTime
  end

  def update_expiration(new_expiration)
    self.update!(self.expiration_attr => new_expiration)
  end

  def get_expiration
    self.expirationTime
  end

  private
  def default_invoice_amount
    80
  end

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
