class RentalsController < ApplicationController

  def index
    @rentals = Rental.all
    render json: @rentals
  end
end
