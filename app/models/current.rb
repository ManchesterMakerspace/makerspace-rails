# A model that is used to track properties without drilling them through fns
class Current < ActiveSupport::CurrentAttributes
    attribute :request_id, :user_agent, :ip_address, :url, :method, :params
end