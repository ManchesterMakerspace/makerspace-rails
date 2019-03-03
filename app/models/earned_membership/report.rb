class EarnedMembership::Report
  include Mongoid::Document

  store_in collection: 'earned_membership__report'

  belongs_to :earned_membership, class_name: 'EarnedMembership'
  has_and_belongs_to_many :requirements, class_name: 'EarnedMembership::Requirement'
  embeds_many :report_requirements, class_name: 'EarnedMembership::ReportRequirement'

  field :date, type: Time, default: Time.now

end