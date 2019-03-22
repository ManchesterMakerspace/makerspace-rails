class EarnedMembership::Term
  include Mongoid::Document

  belongs_to :requirement, class_name: 'EarnedMembership::Requirement'
  has_and_belongs_to_many :reports, class_name: 'EarnedMembership::Report'

  field :start_date, type: Time, default: Time.now
  field :current_count, type: Integer, default: 0
  field :satisfied, type: Boolean, default: false

  validates :requirement, presence: true
  after_update :evaluate_for_satisfaction

  def end_date
    self.start_date && self.requirement.term_length && self.start_date + (self.requirement.term_length.to_i.months)
  end

  private
  def evaluate_for_satisfaction
    if !satisfied && current_count >= requirement.target_count
      self.update(satisfied: true)
      create_next_term
      self.requirement.earned_membership.evaluate_for_renewal
    end
  end

  def create_next_term
    # Determine initial count of next instance
    excess = current_count > requirement.target_count ? (current_count - requirement.target_count) : 0
    start_count = excess >= requirement.rollover_limit ? requirement.rollover_limit : excess
    # Create next requirement
    next_term = EarnedMembership::Term.new(
      start_date: end_date,
      current_count: start_count,
      requirement_id: self.requirement_id
    )
    next_term.save!
  end
end