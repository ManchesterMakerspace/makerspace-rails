class MembersController < ApplicationController
    include FastQuery
    include ::Service::GoogleDrive
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
        begin
          upload_signature(signature_params[:signature], "#{@member.fullname}_signature.png")
          @member.update!(memberContractOnFile: true)
        rescue Error::Google::Upload => err
          @messages.push("Error uploading #{@member.fullname}'s signature'. Error: #{err}")
        end
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
end
