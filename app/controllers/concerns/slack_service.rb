module SlackService
  extend ActiveSupport::Concern
  include Service::SlackConnector

  included do
    after_action :send_messages
  end

  def send_messages
    SlackMessagesJob.perform_later(Current.request_id)
  end
end