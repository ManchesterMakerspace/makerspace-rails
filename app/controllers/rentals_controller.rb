class RentalsController < ApplicationController
  before_action :set_rental, only: [:show]

  def index
    @rentals = Rental.all
  end

  def show
  end

  private
  def rental_params
    binding.pry
    params.require(:rental).permit(:number, :member_id)
  end

  def set_rental
    @rental = Rental.find_by(id: params[:id])
  end
end
