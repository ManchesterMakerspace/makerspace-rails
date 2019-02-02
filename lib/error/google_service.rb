require_relative 'custom_error'
module Error
  class GoogleService < CustomError
    def initialize(error)
      super(:google_service_error, error[:code], error[:message])
    end
  end
end