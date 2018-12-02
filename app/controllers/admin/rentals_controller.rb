class Admin::RentalsController < AdminController
  include SlackService
  include FastQuery
  before_action :set_rental, only: [:update, :destroy]

  def index
    rentals = params[:memberId] ? Rental.where(member_id: params[:memberId]) : Rental.all
    return render_with_total_items(query_resource(rentals))
  end

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
      @messages.push(slack_msg) unless slack_msg.nil?
      send_slack_messages(@messages) unless @messages.empty?
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
    params.require(:rental).permit(:number, :member_id, :expiration, :description)
  end

  def set_rental
    @rental = Rental.find_by(id: params[:id])
  end
end
