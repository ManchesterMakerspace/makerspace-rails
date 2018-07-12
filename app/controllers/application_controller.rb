class ApplicationController < ActionController::Base
  protect_from_forgery
  after_action :set_csrf_cookie_for_ng

  before_action :configure_permitted_parameters, if: :devise_controller?
  # before_action :authenticate_member!, except: [:index, :search_by, :angular]

  def angular
    render 'layouts/application'
  end

  def set_csrf_cookie_for_ng
    cookies['XSRF-TOKEN'] = form_authenticity_token if protect_against_forgery?
  end

  def send_slack_messages(messages)
    msg_string = messages.join(" \n ");
    Slack::Notifier::Util::LinkFormatter.format(msg_string)
  end

  private
  def is_officer?(workshop = nil)
    unless current_member.nil?
      @workshop.try(:officer) == current_member || workshop.try(:officer) == current_member
    end
  end

  protected
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:firstname, :lastname])
  end

  # In Rails 4.2 and above
  def verified_request?
    super || valid_authenticity_token?(session, request.headers['X-XSRF-TOKEN'])
  end
end
