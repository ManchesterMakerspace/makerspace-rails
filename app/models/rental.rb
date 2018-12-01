class Rental
  include Mongoid::Document

  belongs_to :member, optional: true

  field :number
  field :description
  field :expiration
  field :subscription_id, type: String # Braintree relation

  validates :number, presence: true, uniqueness: true

  def prettyTime
    if self.expiration
      return self.getExpiration
    else
      return Time.at(0)
    end
  end

  def getExpiration
    if self.expiration.is_a? Numeric
      return Time.at(self.expiration/1000)
    else
      return Time.parse(self.expiration.to_s)
    end
  end

  def build_slack_msg(initial_date)
    if self.getExpiration && initial_date
      if self.getExpiration > initial_date
        return "#{self.member.fullname}'s rental of Locker/Plot # #{self.number} renewed.  Now expiring #{self.prettyTime.strftime("%m/%d/%Y")}"
      elsif self.getExpiration != initial_date
        return "#{self.member.fullname}'s rental of Locker/Plot # #{self.number} updated.  Now expiring #{self.prettyTime.strftime("%m/%d/%Y")}"
      end
    end
  end

  protected
  def remove_subscription
    self.update({ subscription_id: nil })
  end

  private
  def expiration_attr
    :expiration
  end

  def default_invoice_amount
    25
  end
end
