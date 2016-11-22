class Workshop
  include Mongoid::Document
  store_in collection: "workshops", database: "makerauth", client: 'default'

  validates :name, presence :true, uniqueness :true

  field :name, type: String
  field :accesspoints
  field :officer_id, type: Integer #id of officer
  field :skill_ids, type: Array  #array of _ids pertaining to workshop
end
