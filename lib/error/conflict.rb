require_relative 'custom_error'
module Error
  class Conflict < CustomError
    def initialize(error)
      super(:conflict, 409, error || 'Conflict with resource')
    end
  end
end