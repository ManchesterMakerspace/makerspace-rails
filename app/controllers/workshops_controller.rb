class WorkshopsController < ApplicationController
  include ApplicationHelper
  before_action :set_workshop, only: [:show, :train, :make_expert, :retrain_all, :check_role]

  def index
    if params[:member_id]
      @workshops = Member.find_by(id: params[:member_id]).workshops
      render json: @workshops and return
    else
      @workshops = Workshop.all
      render json: @workshops and return
    end
  end

  def show
      render json: @workshop and return
  end

  def retrain_all
    if current_member == @workshop.officer
      @workshop.retrain_all
      render json: @workshop and return
    else
      render :json, status: 401 and return
    end
  end

  def train
    member = Member.find_by(id: params[:member_id])
    @workshop.train_fully(member)
    render json: member and return
  end

  def make_expert
    member = Member.find_by(id: params[:member_id])
    @workshop.make_expert(member)
    render json: member and return
  end

  private
  def set_workshop
    @workshop = Workshop.find(params[:id])
  end
end
