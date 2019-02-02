module GoogleService
  extend ActiveSupport::Concern

  included do
    before_action :initalize_gdrive
  end

  def initalize_gdrive
    @google = Google::Apis::DriveV3::DriveService.new
    creds = Google::Auth::UserRefreshCredentials.new({
      client_id: ENV['GOOGLE_ID'],
      client_secret: ENV['GOOGLE_SECRET'],
      refresh_token: ENV['GOOGLE_TOKEN'],
      scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]
    })
    @google.authorization = creds
  end
end