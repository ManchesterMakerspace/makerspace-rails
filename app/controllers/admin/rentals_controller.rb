class Admin::RentalsController < ApplicationController
  before_action :set_rental, only: [:update]

  def create
    @rental = Rental.new(rental_params)
    if @rental.save
      render json: @rental and return
    else
      render status: 500 and return
    end
  end

  def update
    if @rental.update(rental_params)
      render json: @rental and return
    else
      render status: 500 and return
    end
  end

  private
  def rental_params
    params.require(:rental).permit(:number, :member_id, :expiration)
  end

  def set_rental
    @rental = Rental.find_by(id: params[:id])
  end
end
