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

  protected
  def remove_subscription
    self.update_attributes!({ subscription_id: nil })
  end

  def expiration_attr
    :expiration
  end
end
