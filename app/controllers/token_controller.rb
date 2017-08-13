class TokenController < ApplicationController

  def create
    @member = Member.find_by(email: params[:email])
    if !!@member
      redirect_to '/#/login', member: @member, msg: 'already registered'
    end
    token = RegistrationToken.new(email: params[:email])
    if token.save
      render json: {status: 200}, status: 200
    else
      render json: {msg: 'Email already taken'}, status: 400
    end
  end

  def validate
    @token = RegistrationToken.find(params[:id])
    challenge_token = params[:token]
    salt = BCrypt::Password.new(@token.token).salt
    hash = BCrypt::Engine.hash_secret(challenge_token, salt)
    valid = Rack::Utils.secure_compare(@token.token, hash)
    if !valid || @token.used
      render json: {status: 400}, status: 400
    else
      render json: @token
    end
  end
end
