require_relative 'custom_error'
require_relative 'helpers/render'

module Error
  module ErrorHandler
    def self.included(clazz)
      include ::Service::SlackConnector
      clazz.class_eval do
        rescue_from StandardError do |e|
          if Rails.env.production?
            message = "Unhandled Error: #{e.message} #{e.backtrace}"
            slack_alert(:interal_server_error, 500, message)
            respond(:interal_server_error, 500, "Internal Server Error")
          else
            raise e
          end
        end
        rescue_from ::Mongoid::Errors::MongoidError do |e|
          slack_alert(:interal_server_error, 500, e.summary || "Internal Server Error")
          respond(:interal_server_error, 500, e.summary || "Internal Server Error")
        end
        rescue_from ::Mongoid::Errors::Validations do |e|
          slack_alert(:unprocessable_entity, 422, e.summary || "Internal Server Error")
          respond(:unprocessable_entity, 422, e.summary || "Internal Server Error")
        end
        rescue_from ::Mongoid::Errors::DocumentNotFound do |e|
          slack_alert(:not_found, 404, e.problem || "Resource not found")
          respond(:not_found, 404,  e.problem || "Resource not found")
        end
        rescue_from ::ActionController::InvalidAuthenticityToken do |e|
          respond(:unauthorized, 401, "Unauthorized")
        end
        rescue_from ::ActionController::ParameterMissing do |e|
          slack_alert(:unprocessable_entity, 422, e.message)
          respond(:unprocessable_entity, 422, e.message)
        end
        rescue_from ::Braintree::NotFoundError do |e|
          slack_alert(:not_found, 404, "Braintree resource not found")
          respond(:not_found, 404, "Braintree resource not found")
        end
        rescue_from CustomError do |e|
          slack_alert(e.status, e.error, e.message)
          respond(e.status, e.error, e.message)
        end
      end
    end

    private

    def respond(_error, _status, _message)
      json = Error::Helpers::Render.json(_error, _status, _message)
      render json: json, status: _status and return
    end

    def slack_alert(_error, _status, _message)
      if _status >= 500
        error_type = "Server"
      elsif _status >= 400
        error_type = "Request"
      else
        error_type = "Unknown"
      end
      user = self.try(:current_member) ? "User #{current_member.fullname}" : "Not authenticated"

      # Dont send slack messages for unauthenticated 404s. We receive these from web crawlers
      # and malicious users. They only serve to clog logs.
      unless !self.try(:current_member) && _status.to_i == 404
        message = "*#{error_type} Error* \n- user: #{user} \n- status: #{_status} \n- error: #{_error} \n- message: #{_message}"
        
        if Current.request_id 
          message += "\n URL: #{Current.method} #{Current.url} \n #{Current.params}"
        end

        # @channel on server errors
        if _status.to_i >= 500 
          message = "<!channel> " + message
        end

        enque_message(message, ::Service::SlackConnector.logs_channel)
        SlackMessagesJob.perform_later(Current.request_id)
      end
    end
  end
end