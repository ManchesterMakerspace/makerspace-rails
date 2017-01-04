module ApplicationHelper
  def is_officer?(workshop = nil)
    if logged_in?
      @workshop.try(:officer) == current_user || workshop.try(:officer) == current_user
    end
  end

  def is_admin?
    if logged_in?
      current_user.try(:admin?)
    end
  end

  def current_user
    unless session[:email].nil?
      Member.find_by(email: session[:email])
    end
  end

  def logged_in?
    !!current_user
  end
end
