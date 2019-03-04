class EarnedMembership
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  store_in collection: 'earned_membership'

  belongs_to :member, class_name: 'Member'
  has_many :requirements, class_name: 'EarnedMembership::Requirement'
  has_many :reports, class_name: 'EarnedMembership::Report'
  accepts_nested_attributes_for :requirements, reject_if: :all_blank, allow_destroy: true
  validate :one_to_one
  validate :existing_subscription, on: :create

  def has_outstanding_requirements
    outstanding_requirements = current_requirements.select do |requirement|
      (requirement.term_start_date + requirement.term_length.months) < member.pretty_time
    end
    !!outstanding_requirements.size
  end

  def current_requirements
    requirements.where(satisfied: false, :term_start_date.lte => member.pretty_time)
  end

  private
  def one_to_one
    member_memberships = EarnedMembership.where(member_id: self.member_id)
    # memberships exist and aren't this one
    if member_memberships.size > 0 && !(member_memberships.size == 1 && member_memberships.first.id == self.id)
      errors.add(:member, "Earned membership already exists for member #{member_memberships.first.member.fullname}")
    end
  end

  def existing_subscription
    if self.member.subscription || self.member.subscription_id
      errors.add(:member, "#{self.member.fullname} is still on subscription. Must cancel subscription first")
    end
  end
end