class Member
  include Mongoid::Document
  include Mongoid::Search
  include ActiveModel::Serializers::JSON
  include InvoiceableResource
  include Service::BraintreeGateway
  include Service::GoogleDrive
  include Service::SlackConnector

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  field :cardID # TODO: I think this can be removed since its an assoc now. Doorboto checks card collection directly
  field :firstname
  field :lastname
  field :status,                         default: "activeMember" # activeMember, nonMember, revoked, inactive
  field :expirationTime,  type: Integer  #pre-calcualted time of expiration
  field :startDate, default: Time.now
  field :groupName #potentially member is in a group/partner membership
  field :role,                          default: "member" #admin,officer,member
  field :memberContractOnFile, type: Boolean, default: false
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
  before_save :update_braintree_customer_info
  # Make sure email is actually spelled differently
  before_update :reinvite_to_services
  after_update :update_card
  after_create :apply_default_permissions, :send_slack_invite, :send_google_invite
  before_destroy :delete_subscription, :delete_rentals

  has_many :permissions, class_name: 'Permission', dependent: :destroy, :autosave => true
  has_many :rentals, class_name: 'Rental'
  has_many :invoices, class_name: "Invoice"
  has_many :access_cards, class_name: "Card", inverse_of: :member
  belongs_to :group, class_name: "Group", inverse_of: :active_members, optional: true, primary_key: 'groupName', foreign_key: "groupName"
  has_one :group, class_name: "Group", inverse_of: :member
  has_one :earned_membership, class_name: 'EarnedMembership', dependent: :destroy

  # Searches by firstname if cant find anything else
  def self.search(searchTerms, criteria = Mongoid::Criteria.new(Member))
    members1 = criteria.full_text_search(searchTerms).sort_by(&:relevance).reverse
    members2 = criteria.full_text_search(searchTerms, index: :_firstname_keywords).sort_by(&:relevance).reverse
    return members1 | members2
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
    send_slack_message(get_renewal_slack_message, ::Service::SlackConnector.safe_channel(slack_user.slack_id)) unless slack_user.nil?
    send_slack_message(get_renewal_slack_message(current_user), ::Service::SlackConnector.members_relations_channel)
  end

  # Emit to Member & Management channels on renewal reversals
  def send_renewal_reversal_slack_message
    slack_user = SlackUser.find_by(member_id: id)
    send_slack_message(get_renewal_reversal_slack_message, ::Service::SlackConnector.safe_channel(slack_user.slack_id)) unless slack_user.nil?
    send_slack_message(get_renewal_reversal_slack_message, ::Service::SlackConnector.members_relations_channel)
  end

  protected
  def base_slack_message
    self.fullname
  end

  def find_braintree_customer
    connect_gateway.customer.find(self.customer_id) unless self.customer_id.nil?
  end

  def update_braintree_customer_info
    if self.customer_id && self.changed.any? { |attr| [:firstname, :lastname].include?(attr) }
      connect_gateway.customer.update(self.customer_id, firstname: self.firstname, lastname: self.lastname)
    end
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

  def reinvite_to_services
    stored_mem = Member.find(id)
    if (!stored_mem || !stored_mem.email || stored_mem.email.downcase != self.email.downcase)
      slack_user = SlackUser.find_by(member_id: id)
      send_slack_invite() if slack_user.nil?
      send_google_invite()
      send_slack_message("Re-invited #{self.fullname} to #{slack_user.nil? ? "Slack and ": ""}Google with new email: #{self.email}")
    end
  end

  def send_slack_invite
    invite_to_slack()
  end

  def send_google_invite
    begin
      invite_gdrive(self.email)
    rescue Error::Google::Upload => err
      send_slack_message("Error sharing Member Resources folder with #{self.fullname}. Error: #{err}")
    end
  end

  def apply_default_permissions
    update_permissions(DefaultPermission.list_as_hash)
  end

  def delete_subscription
    if subscription_id
      ::BraintreeService::Subscription.cancel(::Service::BraintreeGateway.connect_gateway(), subscription_id)
    end
  end

  def delete_rentals
    if rentals.length
      success = rentals.map { |rental| rental.destroy }
      success.all? { |s| !!s }
    end
  end
end
