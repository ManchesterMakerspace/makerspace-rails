module ApplicationHelper
  def is_admin?
      current_member.try(:role) == 'admin'
  end
end
