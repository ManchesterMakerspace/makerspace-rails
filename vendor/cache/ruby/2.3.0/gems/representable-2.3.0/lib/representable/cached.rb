module Representable
  # Using this module only makes sense with Decorator representers.
  module Cached
    # The main point here is that the decorator instance simply saves its mapper. Since the mapper
    # in turn stores the bindings, we have a straight-forward way of "caching" the bindings without
    # having to mess around on the class level: this all happens in the decorator _instance_.
    #
    # Every binding in turn stores its nested representer (if it has one), implementing a recursive caching.
    #
    # Decorator -> Mapper -> [Binding->Decorator, Binding]
    def representable_mapper(format, options)
      @mapper ||= super.tap do |mapper|
        mapper.bindings(represented, options).each { |binding| binding.extend(Binding) }
      end
    end

    # replace represented for each property in this representer.
    def update!(represented)
      @represented = represented
      self
    end

    # TODO: also for deserializer.
    # TODO: create Populator in Binding, too (easier to override).
    module Binding
      def serializer
        @__serializer ||= super.tap do |serializer|
          serializer.extend(Serializer)
        end
      end

      def deserializer
        @__deserializer ||= super.tap do |deserializer|
          deserializer.extend(Serializer)
        end
      end
    end

    module Serializer
      def prepare_for(mod, object)
        if representer = @binding.cached_representer
          return representer.update!(object)
        end

        # puts "--------> caching representer for #{object} in #{@binding.object_id}"
        @binding.cached_representer = super(mod, object)
      end

      # for Deserializer::Collection.
      # TODO: this is a temporary solution.
      def item_deserializer
        @__item_deserializer ||= super.tap do |deserializer|
          deserializer.extend(Serializer)
        end
      end
    end
  end
end