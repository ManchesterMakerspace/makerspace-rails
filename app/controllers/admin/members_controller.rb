class Admin::MembersController < AdminController
  before_action :set_member, only: [:edit, :update]

  def new
    @member = Member.new
    reject = RejectionCard.where(holder: nil).last
    if( !!reject )
      @member.cardID = reject.uid || 'RejectionCard has no ID'
    else
      @member.cardID = 'Not Found'
    end
  end

  def create
    @member = Member.new(member_params)
    if @member.save
      render json: @member
    else
      render status: 500
    end
  end

  def update
    if @member.update(member_params)
      render json: @member
    else
      render status: 500
    end
  end

  private
  def member_params
    params.require(:member).permit(:fullname, :cardID, :groupName, :notificationAck, :accesspoints, :startDate, :role, :email, :slackHandle, :password, :password_confirmation, :status, :renewal => [:months, :start_date], :skill_ids =>[], :learned_skill_ids => [])
  end

  def set_member
    @member = Member.find_by(id: params[:id]) || Member.find_by(id: params[:member][:id]) || Member.find_by(fullname: params[:member][:fullname])
  end
end
