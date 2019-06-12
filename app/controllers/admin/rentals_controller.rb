class Admin::RentalsController < AdminController
  include FastQuery
  before_action :set_rental, only: [:update, :destroy]

  def index
    rentals = params[:memberId] ? Rental.where(member_id: params[:memberId]) : Rental.all
    return render_with_total_items(query_resource(rentals))
  end

  def create
    @rental = Rental.new(rental_params)
    @rental.save!
    render json: @rental and return
  end

  def update
    initial_date = @rental.get_expiration
    @rental.update_attributes!(rental_params)
    notify_renewal(initial_date)
    @rental.reload
    render json: @rental and return
  end

  def destroy
    @rental.delete
    render json: {}, status: 204 and return
  end

  private
  def rental_params
    params.require(:rental).permit(:number, :member_id, :expiration, :description, :renew)
  end

  def set_rental
    @rental = Rental.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Rental, { id: params[:id] }) if @rental.nil?
  end

  def notify_renewal(init)
    final = @rental.get_expiration
    # Check if adding expiration too
    if final &&
        (init.nil? || 
        (Time.at(final / 1000) - Time.at((init || 0) / 1000) > 1.day))
      core_msg = "#{@rental.member ? "#{@rental.member.fullname}'s rental of " : ""} Locker/Plot # #{@rental.number}"
      time = @rental.pretty_time.strftime("%m/%d/%Y")
      @messages.push("#{core_msg} renewed.  Now expiring #{time}")
    end
  end
end
