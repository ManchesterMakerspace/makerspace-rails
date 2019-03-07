class EarnedMembership::Report
  include Mongoid::Document

  store_in collection: 'earned_membership__report'

  belongs_to :earned_membership, class_name: 'EarnedMembership'
  embeds_many :report_requirements, class_name: 'EarnedMembership::ReportRequirement'

  field :date, type: Time, default: Time.now

  accepts_nested_attributes_for :report_requirements, reject_if: :all_blank, allow_destroy: true

end