class MembersController < AuthenticationController
    include FastQuery
    include ::Service::GoogleDrive
    before_action :set_member, only: [:show, :update]

    def index
      # Limit index to only current members unless authorized and requesting full records
      if is_admin? && (params[:currentMembers].nil? || params[:currentMembers].empty?)
        search = Mongoid::Criteria.new(Member)
      else
        # Include unset or expired within grace period
        search = Member.where({
          :$or => [
            { :expirationTime.gte => ((Time.now + 3.days).strftime('%s').to_i * 1000) },
            {  expirationTime: nil }
          ]
        })
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
      raise Error::Forbidden.new unless @member.id == current_member.id

      if signature_params[:signature]
        begin
          encoded_signature = signature_params[:signature].split(",")[1]
          document = upload_document("member_contract", @member, {}, encoded_signature)
          @member.update_attributes!(memberContractOnFile: true)
          MemberMailer.send_document("member_contract", @member.id.as_json, document).deliver_later
        rescue Error::Google::Upload => err
          @messages.push("Error uploading #{@member.fullname}'s member contract signature'. Error: #{err}")
        end
      else
        @member.update_attributes!(member_params)
      end

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
