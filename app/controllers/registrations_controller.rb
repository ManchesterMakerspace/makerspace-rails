class RegistrationsController < Devise::RegistrationsController
    before_action :initalize_gdrive, only: [:create]
    before_action :slack_connect, only: [:create]
    respond_to :json

    def create
      @member = Member.new(member_params)
      correct_token = RegistrationToken.find(params[:member][:token_id])
      @member.cardID = correct_token.token
      if !correct_token.validate(params[:member][:token]) || correct_token.used
        render json: {status: 400}, status: 400 and return
      else
        @member.renewal = correct_token.months
        if @member.save
          correct_token.update(used: true)
          upload_signature
          invite_gdrive
          MemberMailer.member_registered(@member).deliver_now
          sign_in(@member)
          render json: @member and return
        else
          render json: {status: 'error saving member'}, status: 400 and return
        end
      end
    end

    private
    def member_params
      params.require(:member).permit(:firstname, :lastname, :groupName, :email, :password, :password_confirmation)
    end

    def invite_gdrive
      permission = Google::Apis::DriveV3::Permission.new(type: :user,
          email_address: "#{@member.email}",
          role: :reader)
      @service.create_permission(ENV['RESOURCES_FOLDER'], permission) do |result, err|
        @notifier.ping("Error sharing Member Resources folder with #{@member.fullname}. Error: #{err}") unless err.nil?
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

        if result.id then
            File.delete("dump/signature.png")
        end
        @notifier.ping("Error uploading #{@member.fullname}'s signature'. Error: #{err}") unless err.nil?
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
