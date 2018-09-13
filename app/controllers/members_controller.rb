class MembersController < ApplicationController
    include FastQuery
    before_action :set_member, only: [:show]

    def index
      @members = params[:search].empty? ? Member : Member.rough_search_members(params[:search])
      @members = @members.where(:expirationTime => { '$gt' => (Time.now.strftime('%s').to_i * 1000) }) if current_member.try(:role) != 'admin'
      @members = query_resource(@members, params)

      return render_with_total_items(@members)
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
