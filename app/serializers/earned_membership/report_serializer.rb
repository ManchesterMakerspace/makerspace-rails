class EarnedMembership::ReportSerializer < ActiveModel::Serializer
  attributes :id, :date, :earned_membership_id
  has_many :requirements, serializer: EarnedMembership::RequirementSerializer
end