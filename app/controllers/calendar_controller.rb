class CalendarController < ApplicationController
  before_action :init_service

  def index
    @open = @service.list_events(ENV['GOOGLE_CALENDAR'], max_results: 50, q: 'Available', single_events: true)
    render json: @open and return
  end

  private
  def init_service
    @service = Google::Apis::CalendarV3::CalendarService.new
    creds = Google::Auth::UserRefreshCredentials.new({
      client_id: ENV['GOOGLE_ID'],
      client_secret: ENV['GOOGLE_SECRET'],
      refresh_token: ENV['GOOGLE_TOKEN'],
      scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]
    })
    @service.authorization = creds
  end
end
