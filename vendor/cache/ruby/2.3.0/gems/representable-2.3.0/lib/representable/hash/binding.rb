require 'representable/binding'

module Representable
  module Hash
    class Binding < Representable::Binding
      def self.build_for(definition, *args)  # TODO: remove default arg.
        # puts "@@@build@@ #{definition.inspect}"
        return Collection.new(definition, *args)  if definition.array?
        return Hash.new(definition, *args)        if definition.hash?
        new(definition, *args)
      end

      def read(hash)
        return FragmentNotFound unless hash.has_key?(as)

        hash[as] # fragment
      end

      def write(hash, fragment)
        hash[as] = fragment
      end

      def serialize_method
        :to_hash
      end

      def deserialize_method
        :from_hash
      end

      class Collection < self
        include Representable::Binding::Collection
      end


      class Hash < self
        include Representable::Binding::Hash
      end
    end
  end
end
