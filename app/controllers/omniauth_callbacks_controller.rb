class OmniauthCallbacksController < Devise::OmniauthCallbacksController

  def slack
    @user = User.find_for_slack(request.env["omniauth.auth"], current_user)

    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Slack"
      session[:user_id] = @user.id
      sign_in_and_redirect @user, :event => :authentication
    else
      redirect_to new_user_registration_url(@user), notice: "Please create a new account."
    end
  end
end
