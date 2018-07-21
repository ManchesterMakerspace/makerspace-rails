module PaypalService
  mattr_accessor :rest_service, instance_writer: false, instance_reader: false

  def self.api_mode
    PayPal::SDK::REST.new.api_mode
  end

  def self.ipn_valid?(request)
    PayPal::SDK::Core::API::IPN.valid?(request)
  end

  # Core API
  def api_core
    PayPal::SDK::REST
  end

  # Specific API Resource
  def api_service
    self.superclass.name.constantize
  end

  def all
    rest_method = method(:all).super_method
    rest_method.call if defined? rest_method
  end

  # Delete is done w/ a PATCH request changing the resource state
  def delete(resource)
    resource.update({ path: "/", value: { state: "DELETED" }, op: "replace"})
  end

  def activate(resource)
    resource.update({ path: "/", value: { state: "ACTIVE" }, op: "replace"})
  end
end
