class EarnedMembership::Report
  include Mongoid::Document

  store_in collection: 'earned_membership__report'

  belongs_to :earned_membership, class_name: 'EarnedMembership'
  embeds_many :report_requirements, class_name: 'EarnedMembership::ReportRequirement'

  field :date, type: Time, default: Time.now

  accepts_nested_attributes_for :report_requirements, reject_if: :all_blank, allow_destroy: true

  validate :no_future_reporting, on: :create
  after_create :process_report
  before_create :apply_term

  private
  def apply_term
    report_requirements.each { |rr| rr.term = rr.requirement.current_term }
  end

  def process_report
    report_requirements.each { |rr| rr.update_term_count }
  end

  def no_future_reporting
    if self.report_requirements.any? { |rr| rr.requirement.current_term.start_date > Time.now }
      errors.add(:requirement, "Cannot submit reports for future terms")
    end
  end
end