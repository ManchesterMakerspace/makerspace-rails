module Representable
  # Objects marked cloneable will be cloned in #inherit!.
  module Cloneable
    # Implements recursive cloning for Hash.
    # Values to clone have to include Cloneable.
    class Hash < ::Hash
      include Cloneable # This class is marked as Cloneable itself.

      module Clone
        def clone
          self.class[ collect { |k,v| [k, clone_value(v)] } ]
        end

      private
        def clone_value(value)
          return value.clone if value.is_a?(Cloneable)
          value
        end
      end
      include Clone
    end
  end

  # Objects marked cloneable will be inherit!ed in #inherit! when available in parent and child.
  # TODO: #inherit! will be removed in future versions of Representable in favor of #clone, only. manually merging objects sucks.
  module Inheritable
    include Cloneable # all Inheritable are also Cloneable since #clone is one step of our inheritance.

    class Array < ::Array
      include Inheritable

      def inherit!(parent)
        push(*parent.clone)
      end
    end

    # TODO: remove me.
    class Hash < ::Hash
      include Inheritable

      module InstanceMethods
        # FIXME: this method is currently run exactly once, for representable_attrs.inherit!(parent). it is only used for Config.
        def inherit!(parent)
          #merge!(parent.clone)
          for key in (parent.keys + keys).uniq
            next unless parent_value = parent[key]

            self[key].inherit!(parent_value) and next if self[key].is_a?(Inheritable)
            self[key] = parent_value.clone and next if parent_value.is_a?(Cloneable)

            self[key] = parent_value # merge! behaviour
          end

          self
        end

        def clone
          self.class[ collect { |k,v| [k, clone_value(v)] } ]
        end

      private
        def clone_value(value)
          return value.clone if value.is_a?(Cloneable)
          value
        end
      end

      include InstanceMethods
    end
  end
end