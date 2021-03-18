module SetCurrentRequestDetails
  extend ActiveSupport::Concern

  included do
    before_action do
      Current.url = request.url
      Current.method = request.method
      Current.params = request.params
      Current.request_id = request.uuid
      Current.user_agent = request.user_agent
      Current.ip_address = request.ip
    end
  end
end