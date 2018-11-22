class AdminController < ApplicationController
  before_action :authorized?

  private
  def authorized?
    unless is_admin?
      render json: {}, status: 401 and return
    end
  end
end
