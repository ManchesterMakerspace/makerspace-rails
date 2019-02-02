require_relative 'custom_error'
module Error
  class AccountExists < CustomError
    def initialize
      super(:account_exists, 409, 'Account already exists')
    end
  end
end