require_relative 'custom_error'
module Error
  class Forbidden < CustomError
    def initialize
      super(:forbidden, 403, 'Not permitted')
    end
  end
end