class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :authenticate_member!, except: [:index, :search_by]

  private
  def is_officer?(workshop = nil)
    unless current_member.nil?
      @workshop.try(:officer) == current_member || workshop.try(:officer) == current_member
    end
  end

  protected
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:fullname])
  end
end
