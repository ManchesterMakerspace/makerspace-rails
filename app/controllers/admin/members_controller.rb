class Admin::MembersController < AdminController
  before_action :set_member, only: [:show, :edit, :update, :allowed?]
  before_action :set_workshop, only: [:edit]

  def new
    @member = Member.new
  end

  def create
    @member = Member.new(user_params)
    if @member.save
      redirect_to @member, notice: 'Member created successfully'
    else
      render action: 'new', alert: "Creation failed:  #{@member.errors.full_messages}"
    end
  end

  def show
    @workshops = Workshop.all.sort_by(&:name)
  end

  def edit
  end

  def renew
    @member = Member.new
  end

  def update
    if @member.update(user_params)
      redirect_to @member, notice: 'Member updated'
    else
      render action: 'edit', alert: "Update failed:  #{@member.errors.full_messages}"
    end
  end

  private
  def user_params
    params.require(:member).permit(:fullname, :email, :status, :expirationTime, :skill_ids =>[])
  end

  def set_member
    @member = Member.find_by(id: params[:id]) || Member.find_by(id: params[:member][:id])
  end

  def set_workshop
    @workshop = Workshop.find_by(id: params[:workshop_id])
  end
end
