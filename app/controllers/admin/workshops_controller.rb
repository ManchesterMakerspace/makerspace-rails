class Admin::WorkshopsController < AdminController
  before_action :set_workshop, only: [:edit, :update, :destroy]
  def new
    @workshop = Workshop.new
  end

  def create
    @workshop = Workshop.new(workshop_params)
    if @workshop.save
      respond_to do |format|
        format.html { redirect_to @workshop, notice: 'Workshop created successfully' }
        format.json { redirect_to workshops_path }
      end
    else
      respond_to do |format|
        format.html { render :new, alert: "Creation failed:  #{@workshop.errors.full_messages}" }
        format.json { redirect_to workshops_path }
      end
    end
  end

  def edit
    @workshop = Workshop.find_by(id: params[:id])
  end

  def update
    if @workshop.update(workshop_params)
      respond_to do |format|
        format.html { redirect_to workshops_path, notice: 'Workshop updated' }
        format.json { render json: @workshop }
      end
    else
      respond_to do |format|
        format.html { render :edit, alert: "Update failed:  #{@workshop.errors.full_messages}" }
        format.json { render json: @workshop }
      end
    end
  end

  def destroy
    @workshop.destroy
    redirect_to workshops_path, alert: 'Workshop deleted.'
  end

  private
  def workshop_params
    params.require(:workshop).permit(:name, :officer)
  end

  def set_workshop
    @workshop = Workshop.find(params[:id])
  end
end
