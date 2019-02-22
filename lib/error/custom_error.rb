module Error
  class CustomError < StandardError
    attr_reader :status, :error, :message

    def initialize(_status=nil, _error=nil, _message=nil)
      @error = _error || 500
      @status = _status || :internal_server_error
      @message = _message || 'Internal Server Error'
    end
  end
end