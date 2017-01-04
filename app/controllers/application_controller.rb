class ApplicationController < ActionController::Base
  private
  def is_officer?
    unless @workshop.try(:officer) == current_user
      redirect_to root_path, alert: "You are not allowed to access that page."
    end
    true
  end

  def current_user
    unless session[:email].nil?
      Member.find_by(email: session[:email])
    end
  end
end
