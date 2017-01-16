class Member
  include Mongoid::Document
  include ActiveModel::Serializers::JSON
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

 field :fullname #full name of user
 field :cardID # user card id
 field :status,                         default: "current" # current, revoked
 field :accesspoints, type: Array #points of access member (door, machine, etc)
 field :expirationTime, type: Integer #pre-calcualted time of expiration
 field :groupName #potentially member is in a group/partner membership
 field :groupKeystone, type: Boolean
 field :role, default: "member" #admin,officer,member

  ## Database authenticatable
  field :email,              type: String, default: ""
  field :encrypted_password, type: String, default: ""

  ## Recoverable
  field :reset_password_token,   type: String
  field :reset_password_sent_at, type: Time

  ## Rememberable - Handles cookies
  field :remember_created_at, type: Time

  ## Trackable
  # field :sign_in_count,      type: Integer, default: 0
  # field :current_sign_in_at, type: Time
  # field :last_sign_in_at,    type: Time
  # field :current_sign_in_ip, type: String
  # field :last_sign_in_ip,    type: String

  ## Confirmable
  # field :confirmation_token,   type: String
  # field :confirmed_at,         type: Time
  # field :confirmation_sent_at, type: Time
  # field :unconfirmed_email,    type: String # Only if using reconfirmable

  ## Lockable
  # field :failed_attempts, type: Integer, default: 0 # Only if lock strategy is :failed_attempts
  # field :unlock_token,    type: String # Only if unlock strategy is :email or :both
  # field :locked_at,       type: Time

  validates :fullname, presence: true, uniqueness: true

  has_and_belongs_to_many :learned_skills, class_name: 'Skill', inverse_of: :allowed_members
  has_and_belongs_to_many :expertises, class_name: 'Workshop', inverse_of: :experts

  def email_required?
    false
  end

  def password_required?
    !email.blank? && !persisted?
  end

  def officer_of
    Workshop.all.select { |shop| shop.officer == self }.pluck(:name)
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

  def allowed_workshops
    allowed = Workshop.all.collect { |workshop| workshop.skills.all? { |skill| self.learned_skills.include?(skill) } ? workshop : nil}.compact.uniq
    allowed << Workshop.all.select { |shop| shop.officer == self}
    allowed.flatten.uniq.sort_by(&:name)
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

  def revoke
    write_attribute(:status, 'Revoked')
    self.save
  end

  def restore
    write_attribute(:status, 'Current')
    self.save
  end

  def membership_mailer
    if status != 'Group' #Group membership expiration  dates are not accurate and should not be parsed
      if duration == 0
        MemberMailer.expired_member_notification(self).deliver_now
      elsif membership_status == 'expiring'
        MemberMailer.expiring_member_notification(self).deliver_now
      end
    end
  end

  def prettyTime
    Time.at(expirationTime/1000)
  end

  def duration
    prettyTime - Time.now
  end

  def expirationTime=(num_months)
    now_in_ms = (Time.now.strftime('%s').to_i * 1000)
    if (!!self.expirationTime && self.try(:expirationTime) > now_in_ms)
      write_attribute(:expirationTime, (expirationTime + (num_months.to_i*30*24*60*60*1000)) )
    else
      write_attribute(:expirationTime,  (now_in_ms + (num_months.to_i*30*24*60*60*1000)) )
    end
    self.save
  end
end
