class Admin::WorkshopsController < AdminController
  before_action :set_workshop, only: [:update, :destroy]

  def create
    @workshop = Workshop.new(workshop_params)
    if @workshop.save
      render json: @workshop and return
    else
      render json: {status: 500}, status: 500 and return
    end
  end

  def update
    if @workshop.update(workshop_params)
      render json: @workshop and return
    else
      render json: {status: 500}, status: 500 and return
    end
  end

  def destroy
    if @workshop.destroy
      render json: {status: 200}, status: 200 and return
    else
      render json: {status: 500}, status: 500 and return
    end
  end

  private
  def workshop_params
    params.require(:workshop).permit(:name, :officer)
  end

  def set_workshop
    @workshop = Workshop.find(params[:id])
  end
end
