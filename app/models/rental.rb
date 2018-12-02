class Rental
  include Mongoid::Document
  include InvoiceableResource

  belongs_to :member, optional: true

  field :number
  field :description
  field :expiration
  field :subscription_id, type: String # Braintree relation

  validates :number, presence: true, uniqueness: true

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

  def build_slack_msg(initial_date)
    if self.get_expiration && initial_date
      if self.get_expiration > initial_date
        return "#{self.member.fullname}'s rental of Locker/Plot # #{self.number} renewed.  Now expiring #{self.prettyTime.strftime("%m/%d/%Y")}"
      elsif self.get_expiration != initial_date
        return "#{self.member.fullname}'s rental of Locker/Plot # #{self.number} updated.  Now expiring #{self.prettyTime.strftime("%m/%d/%Y")}"
      end
    end
  end

  protected
  def remove_subscription
    self.update({ subscription_id: nil })
  end

  def expiration_attr
    :expiration
  end

  def update_expiration(new_expiration)
    self.update_attribute(self.expiration_attr, get_expiration(new_expiration))
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

  private
  def default_invoice_amount
    25
  end
end
