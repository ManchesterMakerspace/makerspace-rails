class Permission
  include Mongoid::Document

  field :name, type: Symbol
  field :enabled, type: Boolean, default: false

  validates :name, presence: true

  belongs_to :member

  def self.list_permissions
    Permission.distinct(:name)
  end
end