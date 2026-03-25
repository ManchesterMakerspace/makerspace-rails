module ImportResource
  extend ActiveSupport::Concern
  
  module ClassMethods
    def instance_to_hash(resource)
      instance_vars = Hash.new
      resource.instance_variables.each do |v| 
        normalized_name = v.to_s.sub(/^@/, '').to_sym
        instance_var = resource.instance_variable_get(v)

        instance_var = instance_var.map { |i| instance_to_hash(i) } if instance_var.is_a?(Array)
        instance_var = instance_var.to_s if instance_var.is_a? Date

        if !instance_var.is_a?(Braintree::Gateway) && instance_var.class.included_modules.include?(Braintree::BaseModule)
          instance_vars[normalized_name] = instance_to_hash(instance_var)
        else
          instance_vars[normalized_name] = instance_var
        end
      end
      instance_vars
    end
  end
end