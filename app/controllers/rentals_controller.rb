class RentalsController < AuthenticationController
    include FastQuery
    before_action :set_rental, only: [:show]

  def index
    @rentals = Rental.where(member_id: current_member.id)
    return render_with_total_items(query_resource(@rentals))
  end

  def show
    render json: @rental and return
  end

private
  def set_rental
    @rental = Rental.find(params[:id])
    raise ::Mongoid::Errors::DocumentNotFound.new(Rental, { id: params[:id] }) if @rental.nil?
  end
end
