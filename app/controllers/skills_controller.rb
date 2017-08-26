class SkillsController < ApplicationController
  before_action :set_skill, only: [:edit, :update, :destroy]

  def index
    @workshop = Workshop.find_by(id: params[:workshop_id])
    render json: @workshop.skills and return
  end

  def create
    @skill = Skill.new(skill_params)
    if @skill.save
      render json: @skill and return
    else
      render json: @skill, alert: 'Failure' and return
    end
  end

  def update
    if @skill.update(skill_params)
      render json: @skill and return
    else
      render json: @skill, alert: 'Failure' and return
    end
  end

  def destroy
    @workshop = @skill.try(:workshop)
    if (!!@skill)
      @skill.destroy
      if !!@workshop
        render json: @workshop and return
      else
        render json: @workshop  and return
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
