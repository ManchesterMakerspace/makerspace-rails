class ClientErrorHandlerController < ApplicationController
  def create 
    if client_params[:message]
      send_slack_message("Client Error: #{client_params[:message]}", ::Service::SlackConnector.logs_channel)
    end
    render json: {}, status: 204 and return
  end

  private
  def client_params
    params.require(:notification).permit(:message)
  end
end