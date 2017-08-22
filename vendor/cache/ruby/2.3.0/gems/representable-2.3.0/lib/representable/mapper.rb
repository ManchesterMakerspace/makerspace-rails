module Representable
  # Render and parse by looping over the representer's properties and dispatching to bindings.
  # Conditionals are handled here, too.
  class Mapper
    module Methods
      def initialize(bindings)
        @bindings = bindings
      end

      def bindings(represented, options)
        @bindings.each do |binding|
          binding.update!(represented, options)
        end
      end

      def deserialize(represented, doc, options, private_options)
        bindings(represented, options).each do |bin|
          deserialize_property(bin, doc, options, private_options)
        end
        represented
      end

      def serialize(represented, doc, options, private_options)
        bindings(represented, options).each do |bin|
          serialize_property(bin, doc, options, private_options)
        end
        doc
      end

    private
      def serialize_property(binding, doc, options, private_options)
        return if skip_property?(binding, private_options.merge(:action => :serialize))
        compile_fragment(binding, doc)
      end

      def deserialize_property(binding, doc, options, private_options)
        return if skip_property?(binding, private_options.merge(:action => :deserialize))
        uncompile_fragment(binding, doc)
      end

      # Checks and returns if the property should be included.
      #   1.78      0.107     0.025     0.000     0.081    30002   Representable::Mapper::Methods#skip_property?
      #   0.96      0.013     0.013     0.000     0.000    30002   Representable::Mapper::Methods#skip_property? hash only
      #   1.15      0.025     0.016     0.000     0.009    30002   Representable::Mapper::Methods#skip_property?

      def skip_property?(binding, private_options)
        return unless private_options[:include] || private_options[:exclude] || binding.skip_filters?

        return true if skip_excluded_property?(binding, private_options)  # no need for further evaluation when :exclude'ed
        return true if skip_protected_property(binding, private_options)

        skip_conditional_property?(binding)
      end

      def skip_excluded_property?(binding, private_options)
        return unless props = private_options[:exclude] || private_options[:include]
        res   = props.include?(binding.name.to_sym)
        private_options[:include] ? !res : res
      end

      def skip_conditional_property?(binding)
        return unless condition = binding[:if]

        not binding.evaluate_option(:if)
      end

      # DISCUSS: this could be just another :if option in a Pipeline?
      def skip_protected_property(binding, private_options)
        private_options[:action] == :serialize ? binding[:readable] == false : binding[:writeable] == false
      end

      def compile_fragment(bin, doc)
        bin.compile_fragment(doc)
      end

      def uncompile_fragment(bin, doc)
        bin.uncompile_fragment(doc)
      end
    end

    include Methods
  end
end