class RegistrationsController < Devise::RegistrationsController
    before_action :slack_connect, only: [:create]
    respond_to :json

    def create
      @member = Member.new(member_params)
      correct_token = RegistrationToken.find(params[:member][:token_id])
      @member.cardID = correct_token.token
      if !correct_token.validate(params[:member][:token]) || correct_token.used
        render json: {status: 400}, status: 400 and return
      else
        @member.renewal = {months: correct_token.months, start_date: Date.today}
        encoded_img = params[:member][:signature].split(",")[1]
        File.open("dump/signature.png", 'wb') do |f|
          f.write(Base64.decode64(encoded_img))
        end
        creds = Google::Auth::UserRefreshCredentials.new({
          client_id: ENV['GOOGLE_ID'],
          client_secret: ENV['GOOGLE_SECRET'],
          refresh_token: ENV['GOOGLE_TOKEN'],
          scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]
          })
        session = GoogleDrive.login_with_oauth(creds)
        collection = session.file_by_id(ENV['SIGNATURES_FOLDER']);
        collection.upload_from_file(Rails.root.join("dump/signature.png").to_s, "#{@member.fullname}_signature.png", convert: false)
        @notifier.ping("Signature uploaded.")
        File.delete("dump/signature.png")

        if @member.save
          correct_token.update(used: true)
          sign_in(@member)
          render json: @member and return
        else
          render json: {status: 'error saving member'}, status: 400 and return
        end
      end
    end

    private
    def member_params
      params.require(:member).permit(:fullname, :groupName, :email, :password, :password_confirmation)
    end

    def slack_connect
        if Rails.env.production?
          @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'master_slacker',
            icon_emoji: ':ghost:'
        else
          @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
        end
    end
end
