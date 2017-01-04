class SessionsController < ApplicationController

    def new
    end

    def create
    if params[:email].empty?
      redirect_to '/sessions/new', notice: "Error: email required" and return
    else
      session[:email] = params[:email]
      redirect_to root_path
    end
  end


  def show
  end

  def destroy
    if logged_in?
      session.clear
    end
    redirect_to login_path
  end
end
