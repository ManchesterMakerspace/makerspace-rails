module RentalSubscriber
    extend Service::BraintreeGateway
    extend self
  
    def subscribe
      Rental.subscribe(:destroy) do |event|
        subscription_id = event[:model].subscription_id
        if subscription_id
          begin 
            ::BraintreeService::Subscription.cancel(connect_gateway(), subscription_id)
          rescue => err
            enque_message("Error cancelling #{event[:model].member.fullname}'s rental subscription for #{event[:model].number}. Err: #{err}")
          end
        end
      end
    end
  end
    