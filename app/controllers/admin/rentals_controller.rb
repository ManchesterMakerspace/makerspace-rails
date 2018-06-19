class Admin::RentalsController < AdminController
  before_action :set_rental, only: [:update, :destroy]
  before_action :slack_connect, only: [:update]

  def create
    @rental = Rental.new(rental_params)
    if @rental.save
      render json: @rental and return
    else
      render json: {}, status: 500 and return
    end
  end

  def update
    initial_date = @rental.getExpiration
    if @rental.update(rental_params)
      slack_msg = @rental.build_slack_msg(initial_date)
      @notifier.ping slack_msg unless slack_msg.nil?
      @rental.reload
      render json: @rental and return
    else
      render json: {}, status: 500 and return
    end
  end

  def destroy
    if !!@rental
      @rental.delete
      render json: {}, status: 204 and return
    else
      render json: {}, status: 422 and return
    end
  end

  private
  def rental_params
    params.require(:rental).permit(:number, :member_id, :expiration)
  end

  def set_rental
    @rental = Rental.find_by(id: params[:id])
  end

  def slack_connect
    if Rails.env.production?
      @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
              channel: 'membership',
              icon_emoji: ':ghost:'
    else
      @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
    end
  end
end
