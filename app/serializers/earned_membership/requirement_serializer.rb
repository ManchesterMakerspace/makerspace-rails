class EarnedMembership::RequirementSerializer < ActiveModel::Serializer
  attributes :id,
            :earned_membership_id,
            :name,
            :rollover_limit,
            :term_length,
            :target_count,
            :strict,
            :current_count,
            :term_start_date,
            :term_end_date,
            :term_id,
            :satisfied

  def term_end_date
    object.current_term && object.current_term.end_date
  end

  def term_start_date
    object.current_term && object.current_term.start_date
  end

  def current_count
    object.current_term && object.current_term.current_count
  end

  def satisfied
    object.current_term && object.current_term.satisfied
  end

  def term_id
    object.current_term && object.current_term.id
  end
end
