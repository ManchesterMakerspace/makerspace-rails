class Skill
  include Mongoid::Document
  belongs_to :workshop
  has_and_belongs_to_many :allowed_members, class_name: 'Member', inverse_of: :learned_skills

  validates :name, presence: :true, uniqueness: :true

  field :name, type: String
end