class RegistrationsController < Devise::RegistrationsController
    respond_to :json

    def create
      correct_token = RegistrationToken.find(params[:id])
      challenge_token = params[:token]
      salt = BCrypt::Password.new(correct_token.token).salt
      hash = BCrypt::Engine.hash_secret(challenge_token, salt)
      valid = Rack::Utils.secure_compare(correct_token.token, hash)
      if !valid || correct_token.used
        render json: {status: 400}, status: 400
      else
        @member = Member.new(member_params)
        if @member.save
          token.update(used: true)
          render json: @member
        else
          render json: {status: 400}, status: 400
        end
      end
    end

    private
    def member_params
      params.require(:member).permit(:fullname, :groupName, :email, :password, :password_confirmation)
    end
end
