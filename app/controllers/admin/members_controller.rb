class Admin::MembersController < AdminController
  before_action :set_member, only: [:update]
  before_action :slack_connect, only: [:update, :intro]

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
    date = @member.expirationTime
    if @member.update(member_params)
      byebug
      if @member.expirationTime > date
        @notifier.ping "#{@member.fullname} renewed. Now expiring #{@member.prettyTime.strftime("%m/%d/%Y")}"
      end
      render json: @member
    else
      render status: 500
    end
  end

  def welcome_email
    @member = Member.new({fullname: 'Will', email: 'email'})
    render "member_mailer/welcome_email.html.erb"
  end

  def intro
    @member = Member.new(member_params)
    email = MemberMailer.welcome_email(@member)
    if email.deliver_now
      @notifier.ping "Intro email sent to #{@member.email}"
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

  def slack_connect
    @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
  end
end
