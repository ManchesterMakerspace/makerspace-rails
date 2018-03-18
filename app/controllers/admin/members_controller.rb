class Admin::MembersController < AdminController
  before_action :set_member, only: [:update, :renew]
  before_action :slack_connect, only: [:update, :renew]

  def create
    @member = Member.new(member_params)
    if @member.save
      if @member.cardID
        Card.create(uid: @member.cardID, member: @member)
        rejection_card = RejectionCard.find_by(uid: @member.cardID)
        rejection_card.update(holder: @member.fullname) unless rejection_card.nil?
      end
      render json: @member and return
    else
      render json: {}, status: 500 and return
    end
  end

  def update
    date = @member.expirationTime
    if @member.update(member_params)
      if @member.expirationTime && date && @member.expirationTime > date
        @notifier.ping "#{@member.fullname} renewed. Now expiring #{@member.prettyTime.strftime("%m/%d/%Y")}"
      elsif @member.expirationTime != date
        @notifier.ping "#{@member.fullname} updated. Now expiring #{@member.prettyTime.strftime("%m/%d/%Y")}"
      end
      render json: @member and return
    else
      render json: {}, status: 500 and return
    end
  end

  def renew
    date = @member.expirationTime
    if @member.update(renew_params)
      if @member.expirationTime && date && @member.expirationTime > date
        @notifier.ping "#{@member.fullname} renewed. Now expiring #{@member.prettyTime.strftime("%m/%d/%Y")}"
      elsif @member.expirationTime != date
        @notifier.ping "#{@member.fullname} updated. Now expiring #{@member.prettyTime.strftime("%m/%d/%Y")}"
      end
      render json: @member and return
    else
      render json: {}, status: 500 and return
    end
  end

  private
  def member_params
    params.require(:member).permit(:fullname, :cardID, :groupName, :memberContractOnFile, :role, :email, :slackHandle, :password, :password_confirmation, :status, :expirationTime, :renewal => [:months, :start_date])
  end

  def renew_params
    params.require(:member).permit(:fullname, :renewal => [:months, :start_date])
  end

  def set_member
    @member = Member.find_by(id: params[:id]) || Member.find_by(id: params[:member][:id]) || Member.find_by(fullname: params[:member][:fullname])
  end

  def slack_connect
    if Rails.env.production?
      @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
              channel: 'membership',
              icon_emoji: ':ghost:'
    else
      @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
    end
  end
end
