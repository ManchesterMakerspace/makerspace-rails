class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :configure_permitted_parameters, if: :devise_controller?

  private
  def is_officer?
    unless @workshop.try(:officer) == current_member
      redirect_to root_path, alert: "You are not allowed to access that page."
    end
    true
  end

  protected
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:fullname])
  end
end
