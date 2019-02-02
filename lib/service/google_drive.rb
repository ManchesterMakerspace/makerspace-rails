module Service
  module GoogleDrive
    def load_gdrive
      google = Google::Apis::DriveV3::DriveService.new
      google.authorization = Google::Auth::UserRefreshCredentials.new({
        client_id: ENV['GOOGLE_ID'],
        client_secret: ENV['GOOGLE_SECRET'],
        refresh_token: ENV['GOOGLE_TOKEN'],
        scope: ["https://www.googleapis.com/auth/drive"]
      })
      google
    end
  end
end