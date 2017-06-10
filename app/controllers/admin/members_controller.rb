class Admin::MembersController < AdminController
  before_action :set_member, only: [:edit, :update]
  before_action :set_workshop, only: [:edit]

  def new
    @member = Member.new
    @member.cardID = RejectionCard.where(holder: nil).last.uid
  end

  def create
    @member = Member.new(member_params)
    if(!!params["member"]["expirationTime"])
      @member.expirationTime = params["member"]["expirationTime"]
    end
    if @member.save
      respond_to do |format|
        format.html { redirect_to @member, notice: 'Member created successfully' }
        format.json { render json: @member }
      end
    else
      respond_to do |format|
        format.html { render :new, alert: "Creation failed:  #{@member.errors.full_messages}" }
        format.json { render json: @member }
      end
    end
  end

  def edit
  end

  def renew
    @member = Member.new
    @members = Member.all.distinct(:fullname).sort
  end

  def update
    @member.update(member_params)
    if(!!params["member"]["expirationTime"])
      @member.expirationTime = params["member"]["expirationTime"]
    end
    if @member.save
      respond_to do |format|
        format.html { redirect_to @member, notice: 'Member updated' }
        format.json { render json: @member }
      end
    else
      respond_to do |format|
        format.html { render :edit, alert: "Update failed:  #{@member.errors.full_messages}" }
        format.json { render json: @member, alert: "Update failed:  #{@member.errors.full_messages}" }
      end
    end
  end

  private
  def member_params
    params.require(:member).permit(:fullname, :cardID, :groupName, :notificationAck, :accesspoints, :startDate, :role, :email, :slackHandle, :password, :password_confirmation, :status, :skill_ids =>[], :learned_skill_ids => [], :cards_attributes => [:id, :card_location])
  end

  def set_member
    @member = Member.find_by(id: params[:id]) || Member.find_by(id: params[:member][:id]) || Member.find_by(fullname: params[:member][:fullname])
  end

  def set_workshop
    @workshop = Workshop.find_by(id: params[:workshop_id])
  end
end
