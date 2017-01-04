class ApplicationController < ActionController::Base
  private
  def is_officer?
    unless @workshop.try(:officer) == current_user
      redirect_to root_path, alert: "You are not allowed to access that page."
    end
  end

  def is_admin?
    unless current_user.try(:admin?)
      redirect_to root_path, alert: "You are not allowed to access that page."
    end
  end

  def current_user
    Member.find_by(email: session[:email])
  end

  def logged_in?
    !!session[:fullname]
  end
end
