class Workshop
  include Mongoid::Document
  include ActiveModel::Serializers::JSON

  has_many :skills
  belongs_to :officer, class_name: 'Member', inverse_of: :offices
  has_and_belongs_to_many :experts, class_name: 'Member', inverse_of: :expertises
  has_and_belongs_to_many :allowed_members, class_name: 'Member', inverse_of: :allowed_workshops

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
    unless (allowed_members.include?(expert))
      allowed_members << expert
      expert.allowed_workshops << self
    end
    experts << expert
    expert.expertises << self
  end

  def list_experts
    experts.collect { |e| e.fullname }.join(", ")
  end

  def train_fully(member)
    self.skills.each do |skill|
      !member.learned_skills.include?(skill) ? (member.learned_skills << skill) : nil
    end
    !member.allowed_workshops.include?(self) ? (member.allowed_workshops << self) : nil
  end
end
