module SubscriptionHelper
    LIFECYCLES = {
        Created: "CREATED",
        Failed: "FAILED",
        Cancelled: "CANCELLED"
    }

    def self.get_subscription_cache(subscription_id)
        Redis.current.get(subscription_id)
    end

    def self.update_lifecycle(subscription_id, lifecycle)
        Redis.current.set(subscription_id, lifecycle)
    end
end