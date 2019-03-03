class EarnedMembership::ReportRequirement
  include Mongoid::Document

  embedded_in :report, class_name: 'EarnedMembership::Report'

  belongs_to :requirement, class_name: 'EarnedMembership::Requirement'
  has_many :members, class_name: 'Member'

  field :reported_count, type: Integer, default: 0
  field :applied_count, type: Integer, default: 0
end