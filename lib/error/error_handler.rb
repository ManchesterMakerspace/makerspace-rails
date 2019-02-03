require_relative 'custom_error'
require_relative 'helpers/render'

module Error
  module ErrorHandler
    def self.included(clazz)
      clazz.class_eval do
        rescue_from ::Mongoid::Errors::MongoidError do |e|
          respond(:interal_server_error, 500, "Internal Server Error")
        end
        rescue_from ::ActionController::InvalidAuthenticityToken do |e|
          respond(:unauthorized, 401, "Unauthorized")
        end
        rescue_from ::ActionController::ParameterMissing do |e|
          respond(:unprocessable_entity, 422, e.message)
        end
        rescue_from ::Mongoid::Errors::DocumentNotFound do |e|
          respond(:not_found, 404, "Resource not found")
        end
        rescue_from ::Braintree::NotFoundError do |e|
          respond(:not_found, 404, "Braintree resource not found")
        end
        rescue_from CustomError do |e|
          respond(e.status, e.error, e.message)
        end
      end
    end

    private

    def respond(_error, _status, _message)
      json = Error::Helpers::Render.json(_error, _status, _message)
      render json: json, status: _status and return
    end
  end
end