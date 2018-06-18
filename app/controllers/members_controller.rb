class MembersController < ApplicationController
    before_action :set_member, only: [:show]

    def index
      if (params[:search]) then
        @members = Member.rough_search_members(params[:search])
      else
        @members = Member.all.sort_by(&:lastname)
      end
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

    # TODO: Move this to a different controller
    def contract
      creds = Google::Auth::UserRefreshCredentials.new({
        client_id: ENV['GOOGLE_ID'],
        client_secret: ENV['GOOGLE_SECRET'],
        refresh_token: ENV['GOOGLE_TOKEN'],
        scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]
        })
      session = GoogleDrive.login_with_oauth(creds)
      contract = session.file_by_id(ENV['CONTRACT_ID'])
      conduct = session.file_by_id(ENV['CODE_CONDUCT_ID'])
      contract_html = Tempfile.new(['contract', '.html'])
      conduct_html = Tempfile.new(['conduct', '.html'])
      contract.export_as_file(contract_html.path, 'text/html')
      conduct.export_as_file(conduct_html.path, 'text/html')
      render json: {contract: contract_html.read, conduct: conduct_html.read}
      contract_html.close
      contract_html.unlink
      conduct_html.close
      conduct_html.unlink
    end


    private
    def set_member
      @member = Member.find(params[:id])
    end
end
