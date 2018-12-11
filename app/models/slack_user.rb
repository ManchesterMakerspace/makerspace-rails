class SlackUser
  include Mongoid::Document
  belongs_to :member, optional: true

  field :slack_email, type: String
  field :slack_id, type: String
  field :name, type: String
  field :real_name, type: String

  attr_readonly *fields.keys
end