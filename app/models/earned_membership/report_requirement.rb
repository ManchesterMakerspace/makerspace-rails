class EarnedMembership::ReportRequirement
  include Mongoid::Document

  embedded_in :report, class_name: 'EarnedMembership::Report'

  belongs_to :requirement, class_name: 'EarnedMembership::Requirement'
  belongs_to :term, class_name: 'EarnedMembership::Term'

  validates :requirement, presence: true
  validates :term, presence: true
  field :reported_count, type: Integer, default: 0
  field :applied_count, type: Integer, default: 0
  field :member_ids, type: Array

  def update_term_count
    new_requirement_count = self.term.current_count + reported_count
    self.term.update(current_count: new_requirement_count)
  end
end