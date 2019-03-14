class EarnedMembership
  include Mongoid::Document
  include ActiveModel::Serializers::JSON
  include Service::SlackConnector

  store_in collection: 'earned_membership'

  belongs_to :member, class_name: 'Member'
  has_many :requirements, class_name: 'EarnedMembership::Requirement', dependent: :destroy
  has_many :reports, class_name: 'EarnedMembership::Report', dependent: :destroy

  accepts_nested_attributes_for :requirements, reject_if: :all_blank, allow_destroy: true

  validates :member, presence: true
  validate :one_to_one
  validate :existing_subscription, on: :create
  validate :requirements_exist, on: :create

  def outstanding_requirements
    requirements.select do |requirement|
      requirement.current_term && requirement.current_term.end_date < member.pretty_time
    end
  end

  def completed_requirements
    requirements.where(satisfied: true)
  end

  def shortest_requirement
    requirements.min_by(&:term_length)
  end

  def evaluate_for_renewal
    # Find requirements not satisfied and that are not in future terms
    renew_member if outstanding_requirements.size == 0
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
    if self.member.nil?
      errors.add(:memebr, "Member required")
      return
    end
    if self.member.subscription || self.member.subscription_id
      errors.add(:member, "#{self.member.fullname} is still on subscription. Must cancel subscription first")
    end
  end

  def renew_member
    self.member.update(expirationTime: shortest_requirement.current_term.end_date.to_i * 1000)
    time = self.member.pretty_time.strftime("%m/%d/%Y")
    send_slack_message("#{self.member.fullname} earned membership extended to #{time}")
  end

  def requirements_exist
    if self.requirements.nil? or self.requirements.size == 0
      errors.add(:requirements, "required")
    end
  end
end