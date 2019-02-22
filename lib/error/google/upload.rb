require_relative '../custom_error'
module Error::Google
  class Upload < ::Error::CustomError
    def initialize(err=nil)
      super(:internal_server_error, 500, err || 'Error uploading file to Google')
    end
  end
end