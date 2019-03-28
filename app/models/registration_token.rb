class RegistrationToken
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  validates :email, presence: :true
  validate :one_active_token_per_email, on: :create

  field :token, type: String
  field :months, type: Integer, default: 0
  field :email, type: String
  field :role, type: String, default: "member"
  field :used, type: Boolean, default: false

  after_create :generate_token

  def validate(challenge_token)
    salt = BCrypt::Password.new(self.token).salt
    hash = BCrypt::Engine.hash_secret(challenge_token, salt)
    valid = Rack::Utils.secure_compare(self.token, hash)
    valid
  end

  private
  def one_active_token_per_email
    member = Member.where(email: self.email).first
    if member
      errors.add(:email, "Email taken")
    else
      priorTokens = self.class.where(email: self.email, used: false)
      if priorTokens.length > 0
        priorTokens.each do |token|
          token.used = true
          token.save
        end
      end
    end
  end

  def generate_token
    base_token = SecureRandom.urlsafe_base64(nil, false)
    self.token = BCrypt::Password.create(base_token)
    MemberMailer.welcome_email(email, create_link(self.id, base_token)).deliver_later
    self.save
  end

  def create_link(id, base_token)
    return "#/register/#{id}/#{base_token}"
  end
end
