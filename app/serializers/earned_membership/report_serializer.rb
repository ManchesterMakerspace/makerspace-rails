class EarnedMembership::ReportSerializer < ActiveModel::Serializer
  attributes :id, :date, :earned_membership_id
  has_many :report_requirements, serializer: EarnedMembership::ReportRequirementSerializer
end