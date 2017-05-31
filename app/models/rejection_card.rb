class RejectionCard
  include Mongoid::Document
  field :uid #Member's CardID
  field :holder, type: String #Member's name
end
