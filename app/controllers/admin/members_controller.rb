class Admin::MembersController < AdminController
  include SlackService
  before_action :set_member, only: [:update, :renew]

  def create
    @member = Member.new(get_camel_case_params)
    @member.save!
    if @member.cardID
      Card.create(uid: @member.cardID, member: @member)
      rejection_card = RejectionCard.find_by(uid: @member.cardID)
      rejection_card.update(holder: @member.fullname) unless rejection_card.nil?
    end
    render json: @member and return
  end

  def update
    date = @member.expirationTime
    @member.update!(get_camel_case_params)

    if @member.expirationTime && date && @member.expirationTime > date
      @messages.push("#{@member.fullname} renewed. Now expiring #{@member.prettyTime.strftime("%m/%d/%Y")}")
    elsif @member.expirationTime != date
      @messages.push("#{@member.fullname} updated. Now expiring #{@member.prettyTime.strftime("%m/%d/%Y")}")
    end

    send_slack_messages(@messages) unless @messages.empty?
    @member.reload
    render json: @member and return
  end

  private
  def member_params
    params.require(:member).permit(:firstname, :lastname, :role, :email, :status, :expiration_time, :renew)
  end

  def get_camel_case_params
    camel_case_props = {
      expiration_time: :expirationTime,
    }
    params = member_params()
    camel_case_props.each do | key, value|
      params[value] = params.delete(key) unless params[key].nil?
    end
    params
  end

  def set_member
    @member = Member.find_by(id: params[:id])
  end
end
