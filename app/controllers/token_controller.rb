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
      render json: {msg: token.errors}, status: 400 and return
    end
  end

  def validate
    @token = RegistrationToken.find(params[:id])
    challenge_token = params[:token]
    salt = BCrypt::Password.new(@token.token).salt
    hash = BCrypt::Engine.hash_secret(challenge_token, salt)
    valid = Rack::Utils.secure_compare(@token.token, hash)
    if !valid
      redirect_to "/#/login", msg: 'Invalid registration link.'
    elsif @token.used
      redirect_to "/#/login", msg: 'Registeration link already used. Please login.'
    else
      render json: @token
    end
  end
end
