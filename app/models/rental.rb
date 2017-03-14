class Rental
  include Mongoid::Document

  belongs_to :member

  field :number
  field :expiration
end
