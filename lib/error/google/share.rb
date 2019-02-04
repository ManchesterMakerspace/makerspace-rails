require_relative '../custom_error'
module Error::Google
  class Share < ::Error::CustomError
    def initialize(err)
      super(:internal_server_error, 500, err || "Error sharing Google folder")
    end
  end
end