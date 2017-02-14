module ApplicationHelper
  def is_officer?(workshop = nil)
    unless current_member.nil?
      if @workshop.try(:officer) == current_member || workshop.try(:officer) == current_member
        return true
      elsif workshop.nil?
        return current_member.role == "officer"
      end
    end
  end

  def is_admin?
      current_member.try(:role) == 'admin'
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
