class RegistrationsController < ApplicationController
    include BraintreeGateway
    include ApplicationHelper
    respond_to :json

    def new
      email = params[:email]
      raise ::ActionController::ParameterMissing.new(:email) if email.nil?
      member = Member.find_by(email: email)
      if member
        error = "Cannot send registration to #{email}. Account already exists"
        @messages.push(error)
        raise ::Error::AccountExists
      end
      MemberMailer.welcome_email(email).deliver_now
      render json: {}, status: 200 and return
    end

    def create
      @member = Member.new(member_params)
      @member.save!
      sign_in(@member)
      MemberMailer.member_registered(@member).deliver_now
      render json: @member and return
    end

    private
    def member_params
      params.require(:member).permit(:firstname, :lastname, :email, :password)
    end
end
