class SessionsController < ApplicationController

    def new
    end

    def create
    if params[:fullname].empty?
      redirect_to '/sessions/new', notice: "Error: Username required" and return
    else
      session[:name] = params[:name]
      redirect_to '/sessions/show'
    end
  end


  def show
  end

  def destroy
    if logged_in?
      session[:name] = nil
    end
    redirect_to '/sessions/new'
  end
end
