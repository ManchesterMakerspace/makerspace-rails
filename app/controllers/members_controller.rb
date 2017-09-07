class MembersController < ApplicationController
    before_action :set_member, only: [:show]

    def index
      @members = Member.all.sort_by(&:fullname)
      if current_member.try(:role) != 'admin'
        @members = @members.select do |m|
          Time.at(m.expirationTime/1000) - Time.now > 0
        end
      end
      render json: @members and return
    end

    def show
      render json: @member and return
    end

    def contract
      creds = Google::Auth::UserRefreshCredentials.new({
        client_id: ENV['GOOGLE_ID'],
        client_secret: ENV['GOOGLE_SECRET'],
        refresh_token: ENV['GOOGLE_TOKEN'],
        scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]
        })
        session = GoogleDrive.login_with_oauth(creds)
      if Rails.env.production?
        drive_file = session.file_by_id(ENV['CONTRACT_ID'])
      else
        drive_file = session.file_by_id(ENV['TEST_ID'])
      end
      html_file = Tempfile.new(['contract', '.html'])
      drive_file.export_as_file(html_file.path, 'text/html')
      render json: {contract: html_file.read}
    end


    private
    def set_member
      @member = Member.find(params[:id])
    end
end
