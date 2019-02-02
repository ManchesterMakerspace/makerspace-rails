require_relative 'custom_error'
module Error
  class InsufficentPermissions < CustomError
    def initialize
      super(:insufficient_permissions, 403, 'Insufficient permissions to access requested resource')
    end
  end
end