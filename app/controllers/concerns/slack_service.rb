module SlackService
  extend ActiveSupport::Concern
  include Service::SlackConnector

  included do
    before_action :init_slack_client
    after_action :send_messages
  end

  def init_slack_client
    @messages = []
    @client = self.connect_slack
  end

  def send_messages
    @client.send_slack_messages(@messages)
  end
end