class Rental
  include Mongoid::Document
  include InvoiceableResource
  include Service::SlackConnector

  belongs_to :member, optional: true

  field :number
  field :description
  field :expiration
  field :subscription_id, type: String # Braintree relation

  validates :number, presence: true, uniqueness: true
  after_update :notify_renewal

  def prettyTime
    if self.expiration
      return self.expiration_as_time
    else
      return Time.at(0)
    end
  end

  def get_expiration(exp = nil)
    self.expiration_as_ms(exp)
  end

  protected
  def remove_subscription
    self.update!({ subscription_id: nil })
  end

  def expiration_attr
    :expiration
  end

  def update_expiration(new_expiration)
    self.update!(self.expiration_attr => get_expiration(new_expiration))
  end

  def expiration_as_time(ms = nil)
    exp ||= self.expiration
    if exp.is_a? Numeric
      return Time.at(exp/1000)
    else
      return Time.parse(exp.to_s)
    end
  end

  def expiration_as_ms(exp = nil)
    exp ||= self.expiration
    if exp.is_a? Numeric
      return exp
    else
      return exp.to_i * 1000
    end
  end

  def notify_renewal
    if self.expiration_changed?
      init, final = self.expiration_change
      if final && init && final > init
        send_slack_message("#{self.member.fullname}'s rental of Locker/Plot # #{self.number} renewed.  Now expiring #{self.prettyTime.strftime("%m/%d/%Y")}")
      elsif final != init
        send_slack_message("#{self.member.fullname}'s rental of Locker/Plot # #{self.number} updated.  Now expiring #{self.prettyTime.strftime("%m/%d/%Y")}")
      end
    end
  end
end
