require_relative 'custom_error'
module Error
  class Unauthorized < CustomError
    def initialize
      super(:unauthorized, 401, 'Authentication failed. Review credentials and try again.')
    end
  end
end