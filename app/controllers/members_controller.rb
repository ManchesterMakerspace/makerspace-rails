class MembersController < AuthenticationController
    include FastQuery
    include ::Service::GoogleDrive
    before_action :set_member, only: [:show, :update]

    def index
      # Limit index to only current members unless authorized and requesting full records
      if is_admin? && (params[:currentMembers].nil? || params[:currentMembers].empty?)
        search = Mongoid::Criteria.new(Member)
      else
        search = Member.where(:expirationTime => { '$gt' => (Time.now.strftime('%s').to_i * 1000) })
      end
      @members = query_params[:search].nil? || query_params[:search].empty? ? search.all : Member.rough_search_members(query_params[:search], search)
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
        begin
          encoded_img = signature_params[:signature].split(",")[1]
          upload_signature(encoded_img, "#{@member.fullname}_signature.png")
          @member.update_attributes!(memberContractOnFile: true)
        rescue Error::Google::Upload => err
          @messages.push("Error uploading #{@member.fullname}'s signature'. Error: #{err}")
        end
        render json: {}, status: 204 and return
      end

      @member.update_attributes!(member_params)
      render json: @member and return
    end

    private
    def set_member
      @member = Member.find(params[:id])
      raise ::Mongoid::Errors::DocumentNotFound.new(Member, { id: params[:id] }) if @member.nil?
    end

    def signature_params
      params.require(:member).permit(:signature)
    end

    def member_params
      params.require(:member).permit(:firstname, :lastname, :email)
    end
end
