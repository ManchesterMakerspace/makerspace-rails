class Group
  include Mongoid::Document
  field :rep, type: Integer
  field :name, type: String
  field :expiry, type: Number

  belongs_to :rep, class_name: 'Member'
end
