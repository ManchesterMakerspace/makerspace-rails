class Admin::RentalsController < AdminController
  before_action :set_rental, only: [:update, :destroy]

  def create
    @rental = Rental.new(rental_params)
    if @rental.save
      render json: @rental and return
    else
      render json: {}, status: 500 and return
    end
  end

  def update
    if @rental.update(rental_params)
      render json: @rental and return
    else
      render json: {}, status: 500 and return
    end
  end

  def destroy
    if !!@rental
      @rental.delete
      render json: {}, status: 204 and return
    else
      render json: {}, status: 422 and return
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
