class EarnedMembership::ReportRequirementSerializer < ActiveModel::Serializer
  attributes :id, :requirement_id, :reported_count, :applied_count
end