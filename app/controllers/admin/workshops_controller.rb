class Admin::WorkshopsController < AdminController
  before_action :set_workshop, only: [:edit, :update]
  def new
    @workshop = Workshop.new
  end

  def create
    @workshop = Workshop.new(workshop_params)
    if @workshop.save
      redirect_to @workshop, notice: 'Workshop created successfully'
    else
      render action: 'new', alert: "Creation failed:  #{@workshop.errors.full_messages}"
    end
  end

  def edit
    @workshop = Workshop.find_by(id: params[:id])
  end

  def update
    if @workshop.update(workshop_params)
      redirect_to @workshop, notice: 'Workshop updated'
    else
      render action: 'edit', alert: "Update failed:  #{@workshop.errors.full_messages}"
    end
  end

  private
  def workshop_params
    params.require(:workshop).permit(:name, :officer_id, :skills_attributes => [:name, :_destroy])
  end

  def set_workshop
    @workshop = Workshop.find(params[:id])
  end
end
