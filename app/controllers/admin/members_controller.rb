class Admin::MembersController < AdminController
  before_action :set_member, only: [:show, :edit, :update, :allowed?]
  before_action :set_workshop, only: [:edit]

  def new
    @member = Member.new
  end

  def create
    @member = Member.new(user_params)
    if @member.save
      respond_to do |format|
        format.html { render show: @member, notice: 'Member created successfully'}
        format.json { render json: @member, notice: 'Member created successfully' }
      end
    else
      respond_to do |format|
        format.html { render new: @member, alert: "Creation failed:  #{@member.errors.full_messages}" }
        format.json { render json: @member, alert: "Creation failed:  #{@member.errors.full_messages}"}
      end
    end
  end

  def show
    @workshops = Workshop.all.sort_by(&:name)
    respond_to do |format|
      format.html { render show: @member }
      format.json { render json: @member }
    end
  end

  def edit
  end

  def renew
    @member = Member.new
    @members = Member.all.distinct(:fullname).sort
  end

  def update
    if @member.update(user_params)
      respond_to do |format|
        format.html { render show: @member, notice: 'Member updated' }
        format.json { render json: @member, alert: 'Member udpated' }
      end
    else
      respond_to do |format|
        format.html { render edit: @member, alert: "Update failed:  #{@member.errors.full_messages}" }
        format.json { render json: @member, alert: "Update failed:  #{@member.errors.full_messages}" }
      end
    end
  end

  private
  def user_params
    params.require(:member).permit(:fullname, :email, :status, :expirationTime, :skill_ids =>[])
  end

  def set_member
    @member = Member.find_by(id: params[:id]) || Member.find_by(id: params[:member][:id]) || Member.find_by(fullname: params[:member][:fullname])
  end

  def set_workshop
    @workshop = Workshop.find_by(id: params[:workshop_id])
  end
end
