require_relative 'custom_error'
module Error
  class NotFound < CustomError
    def initialize
      super(:not_found, 404, 'Resource not found.')
    end
  end
end