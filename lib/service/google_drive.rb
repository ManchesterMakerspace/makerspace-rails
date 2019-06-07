require_relative '../error/google/share'
require_relative '../error/google/upload'

module Service
  module GoogleDrive
    def load_gdrive
      self.class.load_gdrive
    end

    def self.load_gdrive
      google = Google::Apis::DriveV3::DriveService.new
      google.authorization = Google::Auth::UserRefreshCredentials.new({
        client_id: ENV['GOOGLE_ID'],
        client_secret: ENV['GOOGLE_SECRET'],
        refresh_token: ENV['GOOGLE_TOKEN'],
        scope: ["https://www.googleapis.com/auth/drive"]
      })
      google
    end

    def invite_gdrive(email_address)
      if Rails.env.production? && ENV['BT_ENV'].to_sym == :production
        permission = Google::Apis::DriveV3::Permission.new(type: :user,
            email_address: email_address,
            role: :reader)
        load_gdrive.create_permission(ENV['RESOURCES_FOLDER'], permission) do |result, err|
          raise Error::Google::Share.new(err) unless err.nil?
        end
      end
    end

    def upload_signature(base64_img, file_name)
      self.class.upload_signature(base64_img, file_name)
    end

    def self.upload_signature(base64_img, file_name)
      File.open("dump/signature.png", 'wb') do |f|
        f.write(Base64.decode64(base64_img))
      end
      signature_meta = {
        name: file_name,
        parents: [ENV['SIGNATURES_FOLDER']]
      }
      load_gdrive.create_file(signature_meta,
                          fields: 'id',
                          upload_source: Rails.root.join("dump/signature.png").to_s,
                          content_type: 'image/png'
                          ) do |result, err|
        raise Error::Google::Upload.new(err) unless err.nil?
        File.delete("dump/signature.png")
      end
    end

    def self.upload_backup(file_name)
      backup_meta = {
        name: file_name,
        parents: [ENV['BACKUPS_FOLDER']]
      }
      load_gdrive.create_file(
        backup_meta,
        fields: 'id',
        upload_source: Rails.root.join("dump", file_name).to_s,
      ) do |result, err|
        raise Error::Google::Upload.new(err) unless err.nil?
      end
    end
  end
end