class MembersController < ApplicationController
    include FastQuery
    include GoogleService
    before_action :set_member, only: [:show, :update]
    before_action :initalize_gdrive, only: [:create]

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
      if !signature_params[:signature]
        render json: { message: "Missing parameter: signature" }, status: 400 and return
      end
      response = upload_signature()
      @notifier.ping(format_slack_messages(@messages)) unless @messages.empty?
      if !response[:error].nil?
        render json: { message: response[:error] }, status: 500 and return
      else
        render json: {}, status: 200 and return
      end
    end

    private
    def set_member
      @member = Member.find(params[:id])
    end

    def signature_params
      params.require(:member).permit(:signature)
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
        error = "Error uploading #{@member.fullname}'s signature'. Error: #{err}"
        @messages.push(error) unless err.nil?
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
