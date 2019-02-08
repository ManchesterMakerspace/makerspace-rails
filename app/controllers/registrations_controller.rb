class RegistrationsController < Devise::RegistrationsController
    include BraintreeGateway
    include ApplicationHelper
    respond_to :json

    def new
      email = params[:email]
      raise ::ActionController::ParameterMissing.new(:email) if email.nil?
      member = Member.find_by(email: email)
      if member
        @messages.push("Cannot send registration to #{email}. Account already exists")
        return
      end
      MemberMailer.welcome_email(email, request.base_url).deliver_now
    end

    def create
      @member = Member.new(member_params)
      @member.save!
      sign_in(@member)
      render json: @member and return
    end

    private
    def member_params
      params.require(:member).permit(:firstname, :lastname, :email, :password)
    end
end
