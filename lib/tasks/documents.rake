require 'google/apis/drive_v3'
require_relative '../service/google_drive'

namespace :documents do
  desc "Task to download Member Contract and Code of Conduct from GDrive and save to HTML"
  task :download => :environment do
    # Initialize and Auth GoogleDrive
    drive = Google::Apis::DriveV3::DriveService.new
    drive.authorization = Google::Auth::UserRefreshCredentials.new({
      client_id: ENV['GOOGLE_ID'],
      client_secret: ENV['GOOGLE_SECRET'],
      refresh_token: ENV['GOOGLE_TOKEN'],
      scope: ["https://www.googleapis.com/auth/drive"]
      })

    # Download as HTML
    Service::GoogleDrive.get_templates().each do |template_name, template|
      file = Tempfile.new()
      drive.export_file(template[:file_id], 'text/html', download_dest: file.path)
      document = File.read(file.path)
      # Replace encoded <>
      new_contents = document.gsub(/(&lt;)/, "<").gsub(/(&gt;)/, ">")
      File.open(template[:template_location], "w") { |file| file.puts new_contents }
      file.close()
      file.unlink()
    end
  end

  task :send_update_notice => :environment do 
    members = ::Service::Analytics::Members.query_total_members.each do |member|
      ::MemmberMailer.contract_updated(member.id).deliver_now
    end
  end
end