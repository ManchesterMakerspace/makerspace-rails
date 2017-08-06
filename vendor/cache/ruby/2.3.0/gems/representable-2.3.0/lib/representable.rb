require 'forwardable'

require 'representable/inheritable'
require 'representable/config'
require 'representable/definition'
require 'representable/mapper'
require 'representable/for_collection'
require 'representable/represent'
require 'representable/declarative'
require 'representable/apply'
require "representable/populator"
require "representable/deserializer"
require "representable/serializer"
require "representable/cached"


require "uber/callable"
require "representable/pipeline"

module Representable
  attr_writer :representable_attrs

  def self.included(base)
    base.class_eval do
      extend Declarative
      extend ClassInclusions, ModuleExtensions
      extend ClassMethods
      extend Feature
      extend ForCollection
      extend Represent
      extend Apply
      # register_feature Representable # Representable gets included automatically when creating inline representer.
    end
  end

private
  # Reads values from +doc+ and sets properties accordingly.
  def update_properties_from(doc, options, format)
    propagated_options, private_options = normalize_options!(options)

    representable_mapper(format, propagated_options).deserialize(represented, doc, propagated_options, private_options)
  end

  # Compiles the document going through all properties.
  def create_representation_with(doc, options, format)
    propagated_options, private_options = normalize_options!(options)

    representable_mapper(format, propagated_options).serialize(represented, doc, propagated_options, private_options)
  end

  def representable_bindings_for(format, options)
    representable_attrs.collect {|definition| representable_binding_for(definition, format, options) }
  end

  def representable_binding_for(definition, format, options)
    format.build(definition, self)
  end

  # Make sure we do not change original options. However, private options like :include or :wrap are
  # not passed on to child representers.
  def normalize_options!(options)
    # here, we could also filter out local options e.g. like options[:band].
    private_options = {}
    return [options, private_options] if options.size == 0

    propagated_options = options.dup

    private_options[:include] = propagated_options.delete(:include) if options[:include]
    private_options[:exclude] = propagated_options.delete(:exclude) if options[:exclude]
    propagated_options.delete(:wrap) # FIXME.

    [propagated_options, private_options]
  end

  def representable_attrs
    @representable_attrs ||= self.class.representable_attrs # DISCUSS: copy, or better not? what about "freezing"?
  end

  def representable_mapper(format, options)
    bindings = representable_bindings_for(format, options)
    Mapper.new(bindings)
  end

  def representation_wrap(*args)
    representable_attrs.wrap_for(nil, represented, *args) { self.class.name }
  end

  def represented
    self
  end

  module ClassInclusions
    def included(base)
      super
      base.inherit_module!(self)
    end

    def inherited(subclass) # DISCUSS: this could be in Decorator? but then we couldn't do B < A(include X) for non-decorators, right?
      super
      # FIXME: subclass.representable_attrs is ALWAYS empty at this point.
      subclass.representable_attrs.inherit!(representable_attrs) # this should be inherit_class!
      # DISCUSS: this could also just be: subclass.inheritable_attr :representable_attrs --> superclass.representable_attrs.clone
    end
  end

  module ModuleExtensions
    # Copies the representable_attrs reference to the extended object.
    # Note that changing attrs in the instance will affect the class configuration.
    def extended(object)
      super
      object.representable_attrs=(representable_attrs) # yes, we want a hard overwrite here and no inheritance.
    end
  end


  module ClassMethods
    # Gets overridden by Decorator as inheriting representers via include in Decorator means a bit more work (manifesting).
    def inherit_module!(parent)
      representable_attrs.inherit!(parent.representable_attrs) # Module just inherits.
    end

    def prepare(represented)
      represented.extend(self)
    end
  end


  module Feature
    def feature(*mods)
      mods.each do |mod|
        include mod
        register_feature(mod)
      end
    end

  private
    def register_feature(mod)
      representable_attrs[:features][mod] = true
    end
  end
end

require 'representable/autoload'