class AdminController < ApplicationController
  before_action :authorized?

  private
  def authorized?
    unless current_user.admin?
      redirect_to root_path, alert: "You are not allowed to access that page."
    end
  end
end
