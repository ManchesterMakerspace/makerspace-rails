class SessionsController < ApplicationController
  def create
    if params[:fullname].empty?
      redirect_to '/sessions/new'
    else
      session[:name] = params[:name]
      redirect_to '/sessions/show'
    end
  end

  def new
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
