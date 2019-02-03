class MembersController < ApplicationController
    include FastQuery
    include SlackService
    include GoogleService
    before_action :set_member, only: [:show, :update]

    def index
      @members = query_params[:search].nil? || query_params[:search].empty? ? Member.all : Member.rough_search_members(query_params[:search])
      @members = @members.where(:expirationTime => { '$gt' => (Time.now.strftime('%s').to_i * 1000) }) unless params[:currentMembers] == "" && is_admin?
      @members = query_resource(@members)

      return render_with_total_items(@members, root: :members)
    end

    def show
      render json: @member and return
    end

    def update
      # Non admins can only update themselves
      raise Error::Unauthorized.new unless @member.id == current_member.id

      if signature_params[:signature]
        response = upload_signature()
        send_slack_messages(@messages) unless @messages.empty?
        raise Error::GoogleServiceError.new(response[:error]) unless response[:error].nil?
        render json: {}, status: 204 and return
      end

      @member.update!(member_params)
      render json: @member and return
    end

    private
    def set_member
      @member = Member.find(params[:id])
      raise ::Mongoid::Errors::DocumentNotFound.new if @member.nil?
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
      @google.create_file(signature_meta,
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
            @member.update!(memberContractOnFile: true)
        end
        return { error: error, result: result }
      end
    end
end
