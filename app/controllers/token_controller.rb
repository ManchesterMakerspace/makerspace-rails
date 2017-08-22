class TokenController < ApplicationController

  def create
    @member = Member.find_by(email: params[:email])
    if !!@member
      render json: {msg: 'Email already taken'}, status: 400 and return
    end
    token = RegistrationToken.new(email: params[:email])
    if token.save
      render json: {status: 200}, status: 200 and return
    else
      render json: {msg: 'Token generation error'}, status: 400 and return
    end
  end

  def validate
    @token = RegistrationToken.find(params[:id])
    challenge_token = params[:token]
    salt = BCrypt::Password.new(@token.token).salt
    hash = BCrypt::Engine.hash_secret(challenge_token, salt)
    valid = Rack::Utils.secure_compare(@token.token, hash)
    if !valid || @token.used
      redirect_to "/#/login", msg: 'Email already exists. Please login.'
    else
      render json: @token
    end
  end
end
