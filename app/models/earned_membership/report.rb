class EarnedMembership::Report
  include Mongoid::Document

  store_in collection: 'earned_membership__report'

  belongs_to :earned_membership, class_name: 'EarnedMembership'
  embeds_many :report_requirements, class_name: 'EarnedMembership::ReportRequirement'

  field :date, type: Time, default: Time.now

  accepts_nested_attributes_for :report_requirements, reject_if: :all_blank, allow_destroy: true

  validates :earned_membership, presence: true
  validate :report_requirements_exist, on: :create
  validate :no_future_reporting, on: :create
  after_create :process_report
  before_validation :apply_term, on: :create

  private
  def apply_term
    report_requirements.each { |rr| rr.term.nil? and rr.term = rr.requirement.current_term }
  end

  def process_report
    report_requirements.each { |rr| rr.update_term_count }
  end

  def report_requirements_exist
    if self.report_requirements.nil? or self.report_requirements.size == 0
      errors.add(:requirement, "Cannot submit empty report")
    end
  end

  # Don't allow future reporting if past rollover
  def no_future_reporting
    future_terms = self.report_requirements.select { |rr|
       (
        !rr.requirement || # No requirement or
        (
          !rr.requirement.current_term || # For the future and cant apply rolloverc
          rr.requirement.current_term.start_date > Time.now
        ) &&
        (
          !rr.requirement.rollover_limit.nil? &&
          rr.reported_count >= rr.requirement.rollover_limit
        )
      )
    }
    if future_terms.size > 0
      errors.add(:requirement, "Cannot submit reports for future terms")
    end
  end
end