class RegistrationsController < Devise::RegistrationsController
    respond_to :json

    def create
      correct_token = RegistrationToken.find(params[:member][:token_id])
      challenge_token = params[:member][:token]
      salt = BCrypt::Password.new(correct_token.token).salt
      hash = BCrypt::Engine.hash_secret(challenge_token, salt)
      valid = Rack::Utils.secure_compare(correct_token.token, hash)
      if !valid || correct_token.used
        render json: {status: 400}, status: 400 and return
      else
        @member = Member.new(member_params)
        @member.renewal = {months: correct_token.months, start_date: Date.today}
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
