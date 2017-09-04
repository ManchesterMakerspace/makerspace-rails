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
      render json: {msg: 'Invalid registration link', status: 400}, status: 400 and return
    elsif @token.used
      render json: {msg: 'Registeration link already used. Please login', status: 400}, status: 400 and return
    else
      render json: @token
    end
  end

  def calendar
    service = Google::Apis::CalendarV3::CalendarService.new
    creds = Google::Auth::UserRefreshCredentials.new({
      client_id: ENV['GCALENDAR_ID'],
      client_secret: ENV['GCALENDAR_SECRET'],
      refresh_token: ENV['GCALENDAR_TOKEN'],
      scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]
    })
    service.authorization = creds
    service.list_calendar_lists
  end
end
