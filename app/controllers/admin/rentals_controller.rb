class Admin::RentalsController < AdminController
  include FastQuery::MongoidQuery
  before_action :set_rental, only: [:update, :destroy]

  def index
    rentals = search_params[:member_id] ? Rental.where(member_id: search_params[:member_id]) : Rental.all
    return render_with_total_items(query_resource(rentals), { each_serializer: RentalSerializer, adapter: :attributes })
  end

  def create
    @rental = Rental.new(create_rental_params)
    @rental.save!
    render json: @rental, adapter: :attributes and return
  end

  def update
    initial_date = @rental.get_expiration
    @rental.update_attributes!(update_rental_params)
    notify_renewal(initial_date)
    @rental.reload
    render json: @rental, adapter: :attributes and return
  end

  def destroy
    @rental.destroy
    render json: {}, status: 204 and return
  end

  private
  def create_rental_params
    params.require([:number, :member_id])
    params.permit(:number, :member_id, :expiration, :description, :contract_on_file, :notes)
  end

  def update_rental_params
    params.permit(:number, :member_id, :expiration, :description, :renew, :contract_on_file, :notes)
  end

  def search_params
    params.permit(:member_id)
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
      @rental.send_renewal_slack_message(current_member)
    end
  end
end
