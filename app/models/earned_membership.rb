class EarnedMembership
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  store_in collection: 'earned_membership'

  belongs_to :member, class_name: 'Member'
  has_many :requirements, class_name: 'EarnedMembership::Requirement'

  def has_outstanding_requirements
    outstanding_requirements = current_requirements.select do |requirement|
      (requirement.term_start_date + requirement.term_length.months) < member.pretty_time
    end
    !!outstanding_requirements.size
  end

  def current_requirements
    requirements.where(satisfied: false, :term_start_date.lte => member.pretty_time)
  end
end