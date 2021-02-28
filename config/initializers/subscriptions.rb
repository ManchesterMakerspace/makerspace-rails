Rails.application.config.after_initialize do
    MemberSubscriber.subscribe
end