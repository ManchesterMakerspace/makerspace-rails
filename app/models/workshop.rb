class Workshop
  include Mongoid::Document
  has_many :skills
  belongs_to :officer, class_name: 'Member'

  validates :name, presence: :true, uniqueness: :true

  field :name, type: String
  field :accesspoints
end
