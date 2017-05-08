class Card
  include Mongoid::Document
  field :holder, type: Integer
  field :memberID, type: String
  field :expiry, type: Integer
  field :validity, type: String

  belongs_to :holder, class_name: 'Member'
end
