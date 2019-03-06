class EarnedMembership::RequirementSerializer < ActiveModel::Serializer
  attributes :id,
            :earned_membership_id,
            :name,
            :rollover_limit,
            :term_length,
            :term_start_date,
            :term_end_date,
            :target_count,
            :current_count,
            :satisfied,
            :strict

  def term_end_date
    object.term_start_date && object.term_length && object.term_start_date + (object.term_length.to_i.months)
  end
end
