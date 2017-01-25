class WorkshopsController < ApplicationController
  before_action :set_workshop, only: [:show, :edit, :update, :train, :make_expert, :retrain_all]
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
      render json: @workshop
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

  def retrain_all
    @workshop.retrain_all
    respond_to do |format|
      format.json { render json: @workshop }
    end
  end

  def train
    member = Member.find_by(id: params[:member_id])
    @workshop.train_fully(member)
    respond_to do |format|
      format.json { render json: member }
    end
  end

  def make_expert
    member = Member.find_by(id: params[:member_id])
    @workshop.make_expert(member)
    respond_to do |format|
      format.json { render json: member }
    end
  end

  private
  def set_workshop
    @workshop = Workshop.find(params[:id])
  end

  def workshop_params
    params.require(:workshop).permit(:name, :skills_attributes => [:name, :_destroy])
  end

end
