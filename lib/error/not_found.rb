require_relative 'custom_error'
module Error
  class NotFound < CustomError
    def initialize
      super(:not_found, 404, 'Requested resource does not exist')
    end
  end
end