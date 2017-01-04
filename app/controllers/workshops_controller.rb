class WorkshopsController < ApplicationController
  before_action :set_workshop, only: [:show, :edit, :update, :is_officer?]
  before_action :is_officer?, only: [:edit, :new, :update, :create]

  def index
    if params[:user_id]
      @workshops = Member.find_by(id: params[:member_id]).workshops
    else
      @workshops = Workshop.all
    end
  end

  def show
  end

  def edit
  end

  def update
    if @workshop.update(workshop_params)
      redirect_to @workshop, notice: 'Workshop updated'
    else
      render action: 'edit', alert: "Update failed:  #{@workshop.errors.full_messages}"
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
