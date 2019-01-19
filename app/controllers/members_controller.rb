class MembersController < ApplicationController
    include FastQuery
    include SlackService
    include GoogleService
    before_action :set_member, only: [:show, :update]

    def index
      @members = query_params[:search].nil? || query_params[:search].empty? ? Member.all : Member.rough_search_members(query_params[:search])
      @members = @members.where(:expirationTime => { '$gt' => (Time.now.strftime('%s').to_i * 1000) }) unless is_admin?
      @members = query_resource(@members)

      return render_with_total_items(@members, root: :members)
    end

    def show
      render json: @member and return
    end

    def update
      # Non admins can only update themselves
      if @member.id != current_member.id
        render json: { message: "Unauthorized" }, status: 404 and return
      end

      if signature_params[:signature]
        response = upload_signature()
        send_slack_messages(@messages) unless @messages.empty?
        if !response[:error].nil?
          render json: { message: response[:error] }, status: 500 and return
        else
          render json: {}, status: 200 and return
        end
      end

      if member_params && @member.update(member_params)
        render json: @member and return
      else
        render json: { message: @member.errors.full_messages }, status: 500 and return
      end
    end

    private
    def set_member
      @member = Member.find(params[:id])
    end

    def signature_params
      params.require(:member).permit(:signature)
    end

    def member_params
      params.require(:member).permit(:firstname, :lastname, :email)
    end

    def upload_signature
      encoded_img = signature_params[:signature].split(",")[1]
      File.open("dump/signature.png", 'wb') do |f|
        f.write(Base64.decode64(encoded_img))
      end
      signature_meta = {
        name: "#{@member.fullname}_signature.png",
        parents: [ENV['SIGNATURES_FOLDER']]
      }
      @service.create_file(signature_meta,
                          fields: 'id',
                          upload_source: Rails.root.join("dump/signature.png").to_s,
                          content_type: 'image/png'
                          ) do |result, err|
        unless err.nil?
          error = "Error uploading #{@member.fullname}'s signature'. Error: #{err}"
          @messages.push(error)
        end
        if result && result.id then
            @messages.push("New member #{@member.fullname}'s Member Contract signature uploaded.'")
            File.delete("dump/signature.png")
            @member.update(memberContractOnFile: true)
        end
        return { error: error, result: result }
      end
    end

  def initalize_gdrive
    @service = Google::Apis::DriveV3::DriveService.new
    creds = Google::Auth::UserRefreshCredentials.new({
      client_id: ENV['GOOGLE_ID'],
      client_secret: ENV['GOOGLE_SECRET'],
      refresh_token: ENV['GOOGLE_TOKEN'],
      scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]
    })
    @service.authorization = creds
  end
end
