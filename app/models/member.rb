class Member
  include Mongoid::Document
  include Mongoid::Search
  include ActiveModel::Serializers::JSON
  include InvoiceableResource
  include Service::SlackConnector
  include Publishable

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  field :cardID # TODO: I think this can be removed since its an assoc now. Doorboto checks card collection directly
  field :firstname
  field :lastname
  field :phone
  field :address_street
  field :address_unit
  field :address_city
  field :address_state
  field :address_postal_code

  field :status,                         default: "activeMember" # activeMember, nonMember, revoked, inactive
  field :expirationTime,  type: Integer  #pre-calcualted time of expiration
  field :startDate, default: Time.now
  field :groupName #potentially member is in a group/partner membership
  field :role,                          default: "member" #admin,officer,member
  field :member_contract_signed_date, type: Date
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

  field :silence_emails, type: Boolean # Stop all slack and email notifications to user
  field :notes, type: String

  search_in :email, :lastname
  search_in :firstname, index: :_firstname_keywords

  validates :firstname, presence: true
  validates :lastname, presence: true
  validates :email, uniqueness: true
  validates :cardID, uniqueness: true, allow_nil: true
  validates_inclusion_of :status, in: ["activeMember", "nonMember", "revoked", "inactive"]
  validates_inclusion_of :role, in: ["admin", "member"]

  after_initialize :verify_group_expiry
  after_create :apply_default_permissions, :publish_create
  after_update :update_card, :publish_update
  after_destroy :publish_destroy

  has_many :permissions, class_name: 'Permission', dependent: :destroy, :autosave => true
  has_many :rentals, class_name: 'Rental'
  has_many :invoices, class_name: "Invoice"
  has_many :access_cards, class_name: "Card", inverse_of: :member
  belongs_to :group, class_name: "Group", inverse_of: :active_members, optional: true, primary_key: 'groupName', foreign_key: "groupName"
  has_one :group, class_name: "Group", inverse_of: :member
  has_one :earned_membership, class_name: 'EarnedMembership', dependent: :destroy

  # Searches by firstname if cant find anything else
  def self.search(searchTerms, criteria = Mongoid::Criteria.new(Member))
    # Check if email format, then search email first
    # Otherwise, build lastname, firstname, email
    if !!(searchTerms =~ URI::MailTo::EMAIL_REGEXP)
      results = Member.collection.aggregate([ 
        { 
          :$search => { 
            text: { 
              query: searchTerms, 
              path: "email" 
            } 
          } 
        },
        {
          :$sort => {
            score: { :$meta => "textScore" }
          }
        },
        {
          :$project => {
            _id: 1,
          }
        }
      ]) 
    else
      results = Member.collection.aggregate([ 
        { 
          :$search => { 
            text: { 
              query: searchTerms, 
              path: ["lastname", "firstname", "email"],
              fuzzy: {} # Empty object enables fuzzy searching
            } 
          }, 
        },
        {
          :$sort => {
            score: { :$meta => "textScore" }
          }
        },
        {
          :$project => {
            _id: 1,
          }
        }
      ])
    end
    # collection.aggregate returns base BSON::Documents. Need to map to their class for downstream handlers
    # Fetching exact members or saving will not work
    result_ids = results.collect { |r| r[:_id] }
    members = Member.where(id: { :$in => result_ids })
    members.sort_by{ |m| result_ids.to_a.index m.id}
  end

  def fullname
    return "#{self.firstname} #{self.lastname}"
  end

  def verify_group_expiry
    if self.group
      #make sure member benefits from group expTime
      if benefits_from_group
        self.expirationTime = self.group.expiry
        self.save
      end
    end
  end

  def address=(address_hash)
    unless address_hash.nil?
      self.update_attributes!({
        address_street: address_hash[:street] || self.address_street,
        address_unit: address_hash[:unit] || self.address_unit,
        address_city: address_hash[:city] || self.address_city,
        address_state: address_hash[:state] || self.address_state,
        address_postal_code: address_hash[:postal_code] || self.address_postal_code,
      })
    end
  end

  def memberContractOnFile=(onFile)
    if onFile && member_contract_signed_date.nil?
      self.update_attributes!({ member_contract_signed_date: Date.today })
    elsif !onFile
      self.update_attributes!({ member_contract_signed_date: nil })
    end
  end

  # Find the subscribed resource (instance of Member | Rental) for member
  # Since subscriptions aren't stored in our db, we'll check the subscribed resources
  # to verify ownership
  def find_subscribed_resource(id)
    resource = self if self.subscription_id && self.subscription_id == id
    resource = self.rentals.detect { |r| r.subscription_id == id }  unless resource || self.rentals.nil?
    resource
  end

  def remove_subscription
    self.update_attributes!({ subscription_id: nil, subscription: false })
  end

  def get_permissions
    Hash[permissions.map { |p| [p.name.to_sym, p.enabled] }]
  end

  def update_permissions(permissions_collection)
    permissions_collection.each_pair do |name, enabled|
      permission = permissions.detect { |p| p.name.to_sym == name.to_sym}
      if permission
        permission.update!(enabled: enabled)
      else
        Permission.new(name: name.to_sym, enabled: enabled, member_id: self.id).upsert
      end
    end
  end

  def is_allowed?(permission_name)
    permissions.detect { |p| p.name == permission_name.to_sym && !!p.enabled }
  end

  def delay_invoice_operation(operation)
    if operation.to_sym == :renew=
      (self.access_cards || []).length == 0
    end
  end

  # Emit to Member & Management channels on renewal
  def send_renewal_slack_message(current_user=nil)
    slack_user = SlackUser.find_by(member_id: id)
    enque_message(get_renewal_slack_message, slack_user.slack_id) unless slack_user.nil?
    enque_message(get_renewal_slack_message(current_user), ::Service::SlackConnector.members_relations_channel)
  end

  # Emit to Member & Management channels on renewal reversals
  def send_renewal_reversal_slack_message
    slack_user = SlackUser.find_by(member_id: id)
    enque_message(get_renewal_reversal_slack_message, slack_user.slack_id) unless slack_user.nil?
    enque_message(get_renewal_reversal_slack_message, ::Service::SlackConnector.members_relations_channel)
  end

  protected
  def base_slack_message
    self.fullname
  end

  def expiration_attr
    :expirationTime
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

  def email_required?
    false
  end

  def password_required?
    false
  end

  def publish_create
    # Invite to Slack, Google
    publish(:create)
  end

  def publish_update
    # Invite to Slack, Google if email changed. 
    publish(:email_changed) if changed.any? { |attr| attr.to_sym == :email }
    publish(:billing_info_changed) if changed.any? { |attr| [:firstname, :lastname].include?(attr.to_sym) }
  end

  def publish_destroy
    publish(:destroy)
  end

  def apply_default_permissions
    update_permissions(DefaultPermission.list_as_hash)
  end
end
