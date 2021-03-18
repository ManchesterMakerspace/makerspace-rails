Rails.application.config.after_initialize do
    MemberSubscriber.subscribe
    RentalSubscriber.subscribe
end