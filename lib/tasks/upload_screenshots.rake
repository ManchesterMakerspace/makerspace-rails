task :upload_screenshots => :environment do
  google = Google::Apis::DriveV3::DriveService.new
  google.authorization = Google::Auth::UserRefreshCredentials.new({
    client_id: ENV['GOOGLE_ID'],
    client_secret: ENV['GOOGLE_SECRET'],
    refresh_token: ENV['GOOGLE_TOKEN'],
    scope: ["https://www.googleapis.com/auth/drive"]
  })
  Dir.glob("#{Rails.root}/tmp/screenshots/*.png") do |screenshot|
    file_meta = {
      name: screenshot,
      parents: ["1im4l-Ub3qEOd-ZPwBQTx7_KUkObNSPPw"]
    }
    google.create_file(file_meta,
                      fields: 'id',
                      upload_source: screenshot,
                      content_type: 'image/png')
  end
end