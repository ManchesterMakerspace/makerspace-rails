require 'google/apis/drive_v3'

namespace :documents do
  desc "Task to download Member Contract and Code of Conduct from GDrive and save to HTML"
  task :download => :environment do
    # Initialize and Auth GoogleDrive
    creds = Google::Auth::UserRefreshCredentials.new({
      client_id: ENV['GOOGLE_ID'],
      client_secret: ENV['GOOGLE_SECRET'],
      refresh_token: ENV['GOOGLE_TOKEN'],
      scope: ["https://www.googleapis.com/auth/drive"]
      })

    drive = Google::Apis::DriveV3::DriveService.new
    drive.authorization = creds

    # Export as HTML
    drive.export_file(ENV['CONTRACT_ID'], 'text/html', download_dest: ("#{Rails.public_path.to_s}/member_contract.html"))
    drive.export_file(ENV['CODE_CONDUCT_ID'], 'text/html', download_dest: ("#{Rails.public_path.to_s}/code_of_conduct.html"))
  end
end