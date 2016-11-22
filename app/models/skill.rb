class Skill
  include Mongoid::Document
  store_in collection: "skills", database: "makerauth", client: 'default'

  validates :name, presence :true, uniqueness :true

  field :name, type: String
  field :workshop_id, type: Integer
end
