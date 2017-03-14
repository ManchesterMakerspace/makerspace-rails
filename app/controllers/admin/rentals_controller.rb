class Admin::RentalsController < ApplicationController
  before_action :set_rental, only: [:edit, :update]

  def new
    @rental = Rental.new
  end

  def create
    @rental = Rental.new(rental_params)
    if @rental.save
      respond_to do |format|
        format.html { redirect_to rentals_path, notice: 'Rental created successfully' }
        format.json { render json: @rental }
      end
    else
      respond_to do |format|
        format.html { render :new, alert: "Creation failed:  #{@rental.errors.full_messages}" }
        format.json { render json: @rental }
      end
    end
  end

  def edit
  end

  def update
    @rental.update(rental_params)
    if @rental.save
      respond_to do |format|
        format.html { redirect_to rentals_path, notice: 'Rental updated' }
        format.json { render json: @rental }
      end
    else
      respond_to do |format|
        format.html { render :edit, alert: "Update failed:  #{@rental.errors.full_messages}" }
        format.json { render json: @rental, alert: "Update failed:  #{@rental.errors.full_messages}" }
      end
    end
  end

  private
  def rental_params
    binding.pry
    params.require(:rental).permit(:number, :member_id, :expiration)
  end

  def set_rental
    @rental = Rental.find_by(id: params[:id])
  end
end
