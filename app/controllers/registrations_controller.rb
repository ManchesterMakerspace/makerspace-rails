class RegistrationsController < Devise::RegistrationsController
    include BraintreeGateway
    include ApplicationHelper
    include GoogleService
    respond_to :json

    def create
      @member = Member.new(member_params)
      @member.save!
      if Rails.env == "production"
        invite_to_slack(@member)
        invite_gdrive
      end
      sign_in(@member)

      member_response = ActiveModelSerializers::SerializableResource.new(@member).as_json
      invoice_response = ActiveModelSerializers::SerializableResource.new(@invoice).as_json
      response = {
        member: member_response[:member],
      }
      response[:invoice] = invoice_response[:invoice] unless invoice_response.nil?
      render json:response and return
    end

    private
    def member_params
      params.require(:member).permit(:firstname, :lastname, :email, :password)
    end

    def invite_gdrive
      permission = Google::Apis::DriveV3::Permission.new(type: :user,
          email_address: "#{@member.email}",
          role: :reader)
      @google.create_permission(ENV['RESOURCES_FOLDER'], permission) do |result, err|
        @messages.push("Error sharing Member Resources folder with #{@member.fullname}. Error: #{err}") unless err.nil?
      end
    end


end
