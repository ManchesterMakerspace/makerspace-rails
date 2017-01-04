class Workshop
  include Mongoid::Document
  has_many :skills
  belongs_to :officer, class_name: 'Member'

  accepts_nested_attributes_for :skills, allow_destroy: true,  :reject_if => proc { |attributes| attributes['name'].blank? }

  validates :name, presence: :true, uniqueness: :true

  field :name, type: String
  field :accesspoints
end
