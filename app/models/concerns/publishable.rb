
module Publishable
    extend ActiveSupport::Concern
  
    class_methods do
      def subscribe(event = :any)
        event_name = event == :any ? /#{collection_name}/ : "#{collection_name}.#{event}"
  
        ActiveSupport::Notifications.subscribe(event_name) do |_event_name, **payload|
          yield payload
        end
  
        self
      end
    end
  
    private
    def publish(event)
      event_name = "#{self.class.collection_name}.#{event}"
  
      ActiveSupport::Notifications.publish(event_name, event: event, model: self)
    end
  end