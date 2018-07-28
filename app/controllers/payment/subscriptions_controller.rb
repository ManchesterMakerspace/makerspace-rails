class Payment::SubscriptionsController < ApplicationController
  include BraintreeGateway

  def index
    subs = @gateway.subscription.search
    render json: { subs: subs.ids } and return
  end
end