class Group
  include Mongoid::Document
  field :groupRep
  field :groupName, type: String
  field :expiry, type: Integer

  belongs_to :member, primary_key: 'fullname', foreign_key: "groupRep"
  has_many :active_members, class_name: "Member", inverse_of: :group, primary_key: 'groupName', foreign_key: "groupName"

  after_update :update_active_members
  after_create :update_active_members

  private
  def update_active_members
    self.active_members.each { |m| m.verify_group_expiry }
    self.member.verify_group_expiry
  end
end
