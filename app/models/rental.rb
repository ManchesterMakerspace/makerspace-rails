class Rental
  include Mongoid::Document

  belongs_to :member, optional: true

  field :number
  field :expiration

  validates :number, presence: true, uniqueness: true

  def prettyTime
    if self.expiration
      return self.getExpiration
    else
      return Time.at(0)
    end
  end

  def getExpiration
    return Time.parse(self.expiration.to_s)
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
end
