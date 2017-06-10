class RejectionCard
  include Mongoid::Document
  field :uid #Member's CardID as string
  field :holder, type: String #Member's name
  field :validity, type: String
  field :timeOf, type: Date
end
