class ApplicationController < ActionController::Base
  include ApplicationHelper
  include ::Error::ErrorHandler
  include SlackService

  protect_from_forgery with: :exception
  after_action :set_csrf_cookie_for_ng
  before_action :configure_permitted_parameters, if: :devise_controller?

  def application
    render "layouts/application"
  end

  def set_csrf_cookie_for_ng
    cookies['XSRF-TOKEN'] = form_authenticity_token if protect_against_forgery?
  end

  protected
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:firstname, :lastname])
  end

  # In Rails 4.2 and above
  def verified_request?
    super || valid_authenticity_token?(session, request.headers['X-XSRF-TOKEN'])
  end

  def is_admin?
    current_member.try(:role) == 'admin'
  end
end
