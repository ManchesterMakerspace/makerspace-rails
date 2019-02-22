module SlackService
  extend ActiveSupport::Concern
  include Service::SlackConnector

  attr_accessor :messages

  included do
    @messages = []
    after_action :send_messages
  end

  def send_messages
    send_slack_messages(@messages)
  end
end