class ClientErrorHandlerController < ApplicationController
  def create 
    enque_message("Client Error: #{client_params[:message]}", ::Service::SlackConnector.logs_channel)
    render json: {}, status: 204 and return
  end

  private
  def client_params
    params.require(:message)
    params.permit(:message)
  end
end