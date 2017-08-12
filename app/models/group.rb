class Group
  include Mongoid::Document
  field :groupRep, type: Integer
  field :groupName, type: String
  field :expiry, type: Integer

  belongs_to :member, primary_key: 'fullname', foreign_key: "groupRep"
end
