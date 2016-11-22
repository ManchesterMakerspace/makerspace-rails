class ApplicationController < ActionController::Base
  def current_user
    session[:name]
  end

  def logged_in?
    !!session[:name]
  end
end
