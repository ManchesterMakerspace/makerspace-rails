class Rental
  include Mongoid::Document

  belongs_to :member, optional: true

  field :number
  field :expiration

  validates :number, presence: true, uniqueness: true

end
