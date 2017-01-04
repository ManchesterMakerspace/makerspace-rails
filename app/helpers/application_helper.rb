module ApplicationHelper
  def is_officer?(workshop = nil)
      @workshop.try(:officer) == current_user || workshop.try(:officer) == current_user
  end

  def is_admin?
    current_user.try(:admin?)
  end

  def current_user
    Member.find_by(email: session[:email])
  end

  def logged_in?
    !!current_user
  end
end
