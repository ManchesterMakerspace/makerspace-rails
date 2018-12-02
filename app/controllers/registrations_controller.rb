class RegistrationsController < Devise::RegistrationsController
    include BraintreeGateway
    include ApplicationHelper
    include SlackService
    before_action :initalize_gdrive, only: [:create]
    respond_to :json

    def create
      @member = Member.new(member_params)
      if @member.save
        create_initial_membership_invoice
        invite_to_slack(@member)
        invite_gdrive if Rails.env == "production"
        send_slack_messages(@messages)
        sign_in(@member)

        member_response = ActiveModelSerializers::SerializableResource.new(@member).as_json
        invoice_response = ActiveModelSerializers::SerializableResource.new(@invoice).as_json
        render json: {
          member: member_response[:member],
          invoice: invoice_response[:invoice],
        } and return
      else
        render json: { message: @member.errors.full_messages }, status: 400 and return
      end
    end

    private
    def member_params
      params.require(:member).permit(:firstname, :lastname, :email, :password)
    end

    def invoice_option_params
      params.permit(:membership_selection_id, :discount)
    end

    def invite_gdrive
      permission = Google::Apis::DriveV3::Permission.new(type: :user,
          email_address: "#{@member.email}",
          role: :reader)
      @service.create_permission(ENV['RESOURCES_FOLDER'], permission) do |result, err|
        @messages.push("Error sharing Member Resources folder with #{@member.fullname}. Error: #{err}") unless err.nil?
      end
    end

    def create_initial_membership_invoice
      invoice_option = InvoiceOption.find_by(id: invoice_option_params[:membership_selection_id])
      @invoice = invoice_option.build_invoice(@member.id, Time.now, @member.id, invoice_option_params[:discount])
      unless @invoice.save
        @messages.push("Error creating initial membership invoice for new member: #{@member.email}")
        @messages.concat(@invoice.errors.full_messages)
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
