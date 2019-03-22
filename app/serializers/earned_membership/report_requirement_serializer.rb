class EarnedMembership::ReportRequirementSerializer < ActiveModel::Serializer
  attributes :id, :requirement_id, :reported_count, :applied_count, :member_ids,
      :term_end_date, :term_start_date, :current_count, :satisfied

  def term_end_date
    object.term.end_date
  end

  def term_start_date
    object.term.start_date
  end

  def current_count
    object.term.current_count
  end

  def satisfied
    object.term.satisfied
  end
end