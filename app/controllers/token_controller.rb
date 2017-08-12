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

  def validate
    correct_token = RegistrationToken.find(params[:id])
    challenge_token = params[:token]
    byebug
    salt = BCrypt::Password.new(correct_token.token).salt
    hash = BCrypt::Engine.hash_secret(challenge_token, salt)
    valid = Rack::Utils.secure_compare(correct_token.token, hash)
    if !valid || correct_token.used
      render json: {status: 400}, status: 400
    else
      render json: {status: 200}
    end
  end
end
