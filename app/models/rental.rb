class Rental
  include Mongoid::Document
  include InvoiceableResource
  include Service::SlackConnector

  belongs_to :member, optional: true

  field :number
  field :description
  field :expiration, type: Integer
  field :subscription_id, type: String # Braintree relation

  validates :number, presence: true, uniqueness: true

  # Emit to Member & Management channels on renwal
  def send_renewal_slack_message(current_user)
    slack_user = SlackUser.find_by(member_id: member_id)
    send_slack_message(get_renewal_slack_message, ::Service::SlackConnector.safe_channel(slack_user.slack_id)) unless slack_user.nil?
    send_slack_message(get_renewal_slack_message(current_user), ::Service::SlackConnector.members_relations_channel)
  end

  protected
  def remove_subscription
    self.update_attributes!({ subscription_id: nil })
  end

  def expiration_attr
    :expiration
  end

  def base_slack_message
    "#{self.member ? "#{self.member.fullname}'s rental of " : ""} Locker/Plot # #{self.number}"
  end
end
