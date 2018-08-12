class RentalsController < ApplicationController
    include FastQuery
    before_action :set_rental, only: [:show]

  def index
    @rentals = Rental.all
    return render_with_total_items(query_resource(@rentals, params))
  end

  def show
    render json: @rental and return
  end

private
  def set_rental
    @rental = Rental.find_by(id: params[:id])
  end
end
