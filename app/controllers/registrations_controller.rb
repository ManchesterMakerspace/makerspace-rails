class RegistrationsController < Devise::RegistrationsController
    include BraintreeGateway
    include ApplicationHelper
    before_action :initalize_gdrive, only: [:create]
    before_action :slack_connect, only: [:create]
    respond_to :json

    def create
      @member = Member.new(member_params)
      if @member.save
        create_initial_membership_invoice
        invite_gdrive if Rails.env == "production"
        @notifier.ping(format_slack_messages(@messages)) unless @messages.empty?
        MemberMailer.member_registered(@member).deliver_now
        sign_in(@member)
        render json: @member and return
      else
        render json: { message: @member.errors.full_messages }, status: 400 and return
      end
    end

    private
    def member_params
      params.require(:member).permit(:firstname, :lastname, :email, :password)
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
      plan = ::BraintreeService::Plan.get_plan_by_id(@gateway, ENV["MONTHLY_SUBSCRIPTION_ID"])
      invoice = plan.build_invoice(@member.id, Time.now.change(hour: 0, min: 1))
      unless invoice.save
        @notifier.ping("Error creating initial membership invoice for new member: #{@member.email}")
      end
    end

    def upload_signature
      encoded_img = params[:member][:signature].split(",")[1]
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

        @messages.push("Error uploading #{@member.fullname}'s signature'. Error: #{err}") unless err.nil?
        if result && result.id then
            @messages.push("New member #{@member.fullname}'s Member Contract signature uploaded.'")
            File.delete("dump/signature.png")
        end
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

    def slack_connect
        @messages = []
        if Rails.env.production?
          @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'members_relations',
            icon_emoji: ':ghost:'
        else
          @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
        end
    end
end
