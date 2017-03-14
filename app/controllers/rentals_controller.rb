class RentalsController < ApplicationController

  def index
    @rentals = Rental.all
  end

  private
  def rental_params
    params.require(:rental).permit(:number, :member_id)
  end

end
