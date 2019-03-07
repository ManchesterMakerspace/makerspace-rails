class EarnedMembership::ReportRequirement
  include Mongoid::Document

  embedded_in :report, class_name: 'EarnedMembership::Report'

  belongs_to :requirement, class_name: 'EarnedMembership::Requirement'

  field :reported_count, type: Integer, default: 0
  field :applied_count, type: Integer, default: 0
  field :member_ids, type: Array
end