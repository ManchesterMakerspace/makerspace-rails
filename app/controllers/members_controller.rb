class MembersController < AuthenticationController
    include FastQuery::MongoidQuery
    include ::Service::GoogleDrive
    before_action :set_member, only: [:show, :update]

    def index
      base_query = Member.includes(:access_cards).includes(:earned_membership)
      # Limit index to only current members unless authorized and requesting full records
      if !is_admin? || to_bool(search_params[:current_members])
        # Include unset or expired within grace period
        search = base_query.where({
          :$or => [
            { :expirationTime.gte => ((Time.now + 3.days).strftime('%s').to_i * 1000) },
            {  expirationTime: nil }
          ]
        })
      else
        search = Mongoid::Criteria.new(base_query)
      end
      @members = query_resource(search)

      return render_with_total_items(@members, { each_serializer: MemberSummarySerializer, root: "members" })
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
      params.require(:member).permit(:firstname, :lastname, :email, :phone, address: [:street, :unit, :city, :state, :postal_code])
    end

    def search_params
      params.permit(:current_members)
    end
end
