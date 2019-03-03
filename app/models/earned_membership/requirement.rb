class EarnedMembership::Requirement
  include Mongoid::Document

  store_in collection: 'earned_membership__requirement'

  belongs_to :earned_membership, class_name: 'EarnedMembership'
  has_and_belongs_to_many :reports, class_name: 'EarnedMembership::Report'

  field :name, type: String
  field :rollover_limit, type: Integer, default: 0
  field :term_length, type: Integer, default: 1
  field :term_start_date, type: Time, default: Time.now
  field :target_count, type: Integer
  field :current_count, type: Integer, default: 0
  field :satisfied, type: Boolean, default: false
  field :strict, type: Boolean, default: false

end