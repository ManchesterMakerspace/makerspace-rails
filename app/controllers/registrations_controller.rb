class RegistrationsController < Devise::RegistrationsController
    include BraintreeGateway
    include ApplicationHelper
    respond_to :json

    def create
      @member = Member.create!(member_params)
      sign_in(@member)
      render json: @member and return
    end

    private
    def member_params
      params.require(:member).permit(:firstname, :lastname, :email, :password)
    end
end
