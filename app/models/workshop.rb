class Workshop
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  has_many :skills
  belongs_to :officer, class_name: 'Member'
  has_and_belongs_to_many :experts, class_name: 'Member', inverse_of: :expertises

  field :name, type: String
  field :accesspoints

  accepts_nested_attributes_for :skills, allow_destroy: true,  :reject_if => proc { |attributes| attributes['name'].blank? }

  validates :name, presence: :true, uniqueness: :true

  def member_id=(officer_id)
    officer = Member.find_by(id: officer_id)
    self.officer = officer
    make_expert(officer)
    train_fully(officer)
    officer
  end

  def make_expert(expert)
    experts << expert
  end

  def list_experts
    experts.collect { |e| e.fullname }.join(", ")
  end

  def train_fully(member)
    self.skills.each do |skill|
      !member.learned_skills.include?(skill) ? (member.learned_skills << skill) : nil
    end
  end
end
