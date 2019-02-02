class TokenController < ApplicationController

  def create
    @member = Member.find_by(email: params[:email])
    raise Error::AccountExistsError.new unless !member

    token = RegistrationToken.new(email: params[:email])
    token.save!
    render json: {}, status: 200 and return
  end

  def validate
    @member = Member.find_by(email: params[:email])
    raise Error::AccountExistsError.new unless !member

    @token = RegistrationToken.find(params[:id])
    render json: {msg: 'Invalid registration link'}, status: 400 and return if !@token

    challenge_token = params[:token]
    salt = BCrypt::Password.new(@token.token).salt
    hash = BCrypt::Engine.hash_secret(challenge_token, salt)
    valid = Rack::Utils.secure_compare(@token.token, hash)

    raise Error::NotFound.new unless valid
    raise Error::CustomError.new(:already_used, 400, "Registeration link already used. Please login")
    render json: @token
  end
end
