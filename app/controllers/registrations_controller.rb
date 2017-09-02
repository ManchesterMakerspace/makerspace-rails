class RegistrationsController < Devise::RegistrationsController
    respond_to :json

    def create
      @member = Member.new(member_params)
      correct_token = RegistrationToken.find(params[:member][:token_id])
      if !correct_token.validate(params[:member][:token]) || correct_token.used
        render json: {status: 400}, status: 400 and return
      else
        @member.renewal = {months: correct_token.months, start_date: Date.today}
        encoded_img = params[:member][:signature].split(",")[1]
        File.open("dump/signature.png", 'wb') do |f|
          f.write(Base64.decode64(encoded_img))
        end
        if Rails.env.production?
          credentials = Google::Auth::UserRefreshCredentials.new(JSON.parse(ENV['GDRIVE_CREDS']))
          session = GoogleDrive.login_with_oauth(credentials)
          session.upload_from_file(Rails.root.join("dump/signature.png").to_s, "#{@member.fullname}_signature.png", convert: false)
          notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'master_slacker',
            icon_emoji: ':ghost:'
          notifier.ping("Signature uploaded.")
        else
          GoogleDrive::Session.from_config("config.json").upload_from_file(Rails.root.join("dump/signature.png").to_s, "#{@member.fullname}_signature.png", convert: false)
          notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
          notifier.ping("Signature uploaded.")
        end
        File.delete("dump/signature.png")
        if @member.save
          correct_token.update(used: true)
          render json: @member and return
        else
          render json: {status: 400}, status: 400 and return
        end
      end
    end

    private
    def member_params
      params.require(:member).permit(:fullname, :groupName, :email, :password, :password_confirmation)
    end
end
