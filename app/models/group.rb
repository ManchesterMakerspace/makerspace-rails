class Group
  include Mongoid::Document
  field :groupRep, type: Integer
  field :groupName, type: String
  field :expiry, type: Integer

  belongs_to :member, primary_key: 'fullname', foreign_key: "groupRep"
  has_many :active_members, class_name: "Member", inverse_of: :group, primary_key: 'groupName', foreign_key: "groupName"
end
