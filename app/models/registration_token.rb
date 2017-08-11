class RegistrationToken
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  validates :email, presence: :true, uniqueness: :true

  field :token, type: String
  field :email, type: String
  field :role, type: String, default: "member"
  field :used, type: Boolean, default: false

  after_create :generate_token

  protected
  def generate_token
    base_token = SecureRandom.urlsafe_base64(nil, false)
    self.token = BCrypt::Password.create(base_token)
    MemberMailer.welcome_email(email, create_link(self.id, base_token)).deliver_now
  end

  def create_link(id, token)
    return "http://localhost:3002/#/register/#{id}/#{token}"
  end
end
