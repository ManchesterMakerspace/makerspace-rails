class EarnedMembership::RequirementSerializer < ActiveModel::Serializer
  attributes :id,
            :earned_membership_id,
            :name,
            :rollover_limit,
            :term_length,
            :term_start_date,
            :target_count,
            :current_count,
            :satisfied,
            :strict
end
