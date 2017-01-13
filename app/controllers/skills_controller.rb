class SkillsController < ApplicationController
  before_action :set_skill, only: [:show, :edit, :update, :destroy]

  def index
    @workshop = Workshop.find_by(id: params[:workshop_id])
    render :layout => false
  end

  def new
    @workshop = Workshop.find_by(id: params[:workshop_id])
    @skill = Skill.new(workshop_id: params[:workshop_id])
  end

  def create
    @skill = Skill.new(skill_params)
    if @skill.save
      respond_to do |format|
        format.html { redirect_to workshop_path(@skill.workshop_id), notice: 'New skill created successfully' }
        format.json { render json: @skill.to_json }
      end
    else
      @workshop = Workshop.find_by(id: params[:workshop_id])
      respond_to do |format|
        format.html { render :new, alert: "Creation failed:  #{@skill.errors.full_messages}" }
        format.json { render json: @skill.to_json, alert: 'Failure' }
      end
    end
  end

  def edit
    @workshop = Workshop.find_by(id: params[:workshop_id])
  end

  def update
    if @skill.update(skill_params)
      respond_to do |format|
        format.html { redirect_to workshop_path(@skill.workshop_id), notice: 'Skill updated' }
        format.json { render json: @skill.to_json }
      end
    else
      respond_to do |format|
        format.html { render :edit, alert: "Update failed:  #{@skill.errors.full_messages}" }
        format.json { render json: @skill.to_json, alert: 'Failure' }
      end
    end
  end

  def destroy
    @workshop = @skill.try(:workshop)
    if (!!@skill)
      @skill.destroy
      if !!@workshop
        respond_to do |format|
          format.html { redirect_to workshop_path(@workshop), notice: 'Skill deleted' }
          format.json { render json: @workshop }
        end
      else
        respond_to do |format|
          format.html { redirect_to workshops_path, notice: 'Skill deleted' }
          format.json { render json: @workshop }
        end
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
