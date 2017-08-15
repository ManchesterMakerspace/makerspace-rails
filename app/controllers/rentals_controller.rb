class RentalsController < ApplicationController
  before_action :set_rental, only: [:show]

  def index
    @rentals = Rental.all
    render json: @rentals and return
  end

  def show
    render json: @rental and return
  end

private
  def set_rental
    @rental = Rental.find_by(id: params[:id])
  end
end
