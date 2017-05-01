class RentalsController < ApplicationController

  def index
    @rentals = Rental.all
    @members = Member.all
  end

  private
  def rental_params
    params.require(:rental).permit(:number, :member_id)
  end

end
