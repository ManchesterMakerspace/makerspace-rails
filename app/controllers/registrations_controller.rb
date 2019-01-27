class RegistrationsController < Devise::RegistrationsController
    include BraintreeGateway
    include ApplicationHelper
    include SlackService
    include GoogleService
    respond_to :json

    def create
      @member = Member.new(member_params)
      if @member.save
        create_initial_membership_invoice
        if Rails.env == "production"
          invite_to_slack(@member)
          invite_gdrive
        end
        send_slack_messages(@messages)
        sign_in(@member)

        member_response = ActiveModelSerializers::SerializableResource.new(@member).as_json
        invoice_response = ActiveModelSerializers::SerializableResource.new(@invoice).as_json
        response = {
          member: member_response[:member],
        }
        response[:invoice] = invoice_response[:invoice] unless invoice_response.nil?
        render json:response and return
      else
        render json: { message: @member.errors.full_messages }, status: 400 and return
      end
    end

    private
    def member_params
      params.require(:member).permit(:firstname, :lastname, :email, :password)
    end

    def invoice_option_params
      params.permit(:membership_selection_id, :discount_id)
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
      if (invoice_option_params[:discount_id])
        discounts = ::BraintreeService::Discount.get_discounts(@gateway)
        invoice_discount = discounts.find { |d| d.id == invoice_option_params[:discount_id]}
      end
      if invoice_option
        @invoice = invoice_option.build_invoice(@member.id, Time.now, @member.id, invoice_discount)
        unless @invoice.save
          @messages.push("Error creating initial membership invoice for new member: #{@member.email}")
          @messages.concat(@invoice.errors.full_messages)
        end
      end
    end
end
