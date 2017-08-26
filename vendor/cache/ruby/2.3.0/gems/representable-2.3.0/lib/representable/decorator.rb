require "representable"

module Representable
  class Decorator
    class << self
      include Cloneable
    end

    attr_reader :represented
    alias_method :decorated, :represented

    # TODO: when moving all class methods into ClassMethods, i get a segfault.
    def self.prepare(represented)
      new(represented)
    end

    def self.default_inline_class
      Representable::Decorator
    end

    # This is called from inheritable_attr when inheriting a decorator class to a subclass.
    # Explicitly subclassing the Decorator makes sure representable_attrs is a clean version.
    def self.clone
      Class.new(self) # DISCUSS: why isn't this called by Ruby?
    end

    include Representable # include after class methods so Decorator::prepare can't be overwritten by Representable::prepare.

    # TODO: implement that just by calling ::property(name, options){include mod} on the inheriting representer.
    module InheritModule
      def inherit_module!(parent)
        inherited_attrs = parent.representable_attrs[:definitions].keys

        super # in Representable, calls representable_attrs.inherit!(parent.representable_attrs).
        # now, inline representers are still modules, which is wrong.
        manifest!(inherited_attrs)
      end

    private
       # one level deep manifesting modules into Decorators.
      def manifest!(names)
        names.each do |name| # only definitions.
          definition = representable_attrs.get(name)
          next unless definition[:_inline] and mod = definition.representer_module # only inline representers.

          # here, we can include Decorator features.
          inline_representer = build_inline(nil, representable_attrs.features, definition.name, {}) {
            include mod
          } # the includer controls what "wraps" the module.

          definition.merge!(:extend => inline_representer)
        end
      end
    end
    extend InheritModule


    def initialize(represented)
      @represented = represented
    end

  private
    def self.build_inline(base, features, name, options, &block)
      Class.new(base || default_inline_class) do
        feature *features
        class_eval &block
      end
    end
  end
end
