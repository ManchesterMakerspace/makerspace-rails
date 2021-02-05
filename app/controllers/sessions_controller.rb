class SessionsController < Devise::SessionsController
    def create
        resource = warden.authenticate!(:scope => resource_name, :recall => "#{controller_path}#new")
        sign_in(resource_name, resource)
        render json: resource, adapter: :attributes and return
    end
end
