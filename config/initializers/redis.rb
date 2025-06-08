Redis.current = Redis.new(url: ENV['REDIS_URL'],
                          port: ENV['REDIS_PORT'],
                          db: ENV['REDIS_DB'],
                          ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })