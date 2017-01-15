class WorkshopsController < ApplicationController
  before_action :set_workshop, only: [:show, :edit, :update]
  before_action :is_officer?, only: [:edit, :new, :update, :create]

  def index
    if params[:member_id]
      @workshops = Member.find_by(id: params[:member_id]).workshops
      respond_to do |format|
        format.html { render :index }
        format.json { render json: @workshops }
      end
    else
      @workshops = Workshop.all
      respond_to do |format|
        format.html { render :index }
        format.json { render json: @workshops }
      end
    end
  end

  def show
    respond_to do |format|
      format.html { render :layout => false }
      format.json { render json: @workshop }
    end
  end

  def edit
  end

  def update
    if @workshop.update(workshop_params)
      respond_to do |format|
        format.html { redirect_to @workshop, notice: 'Workshop updated' }
        format.json { render json: @workshop }
      end
    else
      respond_to do |format|
        format.html { render :edit, alert: "Update failed:  #{@workshop.errors.full_messages}" }
        format.json { render json: @workshop }
      end
    end
  end

  private
  def set_workshop
    @workshop = Workshop.find(params[:id])
  end

  def workshop_params
    params.require(:workshop).permit(:name, :member_id, :skill_ids=> [], :skills_attributes => [:name, :_destroy])
  end

end
