class DefaultPermission
  include Mongoid::Document

  field :name, type: Symbol
  field :enabled, type: Boolean, default: false

  validates :name, presence: true

  def self.list_permissions
    self.distinct(:name)
  end

  def self.list_as_hash
    default_permissions = Hash.new
    self.all.each { |p| default_permissions[p.name] = p.enabled }
    default_permissions
  end
end