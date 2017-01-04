module ApplicationHelper
  def is_officer?(workshop = nil)
      @workshop.try(:officer) == current_member || workshop.try(:officer) == current_member
  end

  def is_admin?
      current_member.try(:admin?)
  end

  # def current_user
  #   unless session[:email].nil?
  #     Member.find_by(email: session[:email])
  #   end
  # end
  #
  # def logged_in?
  #   !!current_user
  # end
end
