class SkillsController < ApplicationController
  before_action :set_skill, only: [:edit, :update, :destroy]

  def index
    @workshop = Workshop.find_by(id: params[:workshop_id])
    render json: @workshop.skills
  end

  def new
    @workshop = Workshop.find_by(id: params[:workshop_id])
    @skill = Skill.new(workshop_id: params[:workshop_id])
  end

  def create
    @skill = Skill.new(skill_params)
    if @skill.save
      format.json { render json: @skill }
    else
      format.json { render json: @skill, alert: 'Failure' }
    end
  end

  def edit
    @workshop = Workshop.find_by(id: params[:workshop_id])
  end

  def update
    if @skill.update(skill_params)
      format.json { render json: @skill }
    else
      format.json { render json: @skill, alert: 'Failure' }
    end
  end

  def destroy
    @workshop = @skill.try(:workshop)
    if (!!@skill)
      @skill.destroy
      if !!@workshop
        format.json { render json: @workshop }
      else
        format.json { render json: @workshop }
      end
    end
  end

  private
  def skill_params
    params.require(:skill).permit(:name, :workshop_id)
  end

  def set_skill
    @skill = Skill.find_by(id: params[:id])
  end

end
