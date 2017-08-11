class TokenController < ApplicationController

  def new
    prior_member = Member.find_by(email: params[:email])
    if !!prior_member
      render :json, status: 400
    end
    token = RegistrationToken.new(email: params[:email])
    if token.save
      render json: {status: 200}, status: 200
    else
      render :json, status: 400
    end
  end
end
