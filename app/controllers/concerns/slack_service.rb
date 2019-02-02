module SlackService
  extend ActiveSupport::Concern
  include Service::SlackConnector

  included do
    before_action :init_slack_client
  end

  def init_slack_client
    @messages = []
    @client = self.connect
  end
end