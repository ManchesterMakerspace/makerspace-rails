module JSONAPI
  class Validator
    class << self
      TOP_LEVEL_KEYS = [:data, :errors, :meta].freeze
      EXTENDED_TOP_LEVEL_KEYS = (TOP_LEVEL_KEYS +
                                 [:jsonapi, :links, :included]).freeze
      RESOURCE_KEYS = [:id, :type, :attributes, :relationships, :links,
                       :meta].freeze
      RESOURCE_IDENTIFIER_KEYS = [:id, :type].freeze
      EXTENDED_RESOURCE_IDENTIFIER_KEYS = (RESOURCE_IDENTIFIER_KEYS +
                                           [:meta]).freeze
      RELATIONSHIP_KEYS = [:data, :links, :meta].freeze
      RELATIONSHIP_LINK_KEYS = [:self, :related].freeze
      JSONAPI_OBJECT_KEYS = [:version, :meta].freeze

      # Validate the structure of a JSON API document.
      def validate!(document)
        @document = document
        raise InvalidDocument unless @document.is_a?(Hash)
        raise InvalidDocument if @document.keys.empty?
        raise InvalidDocument unless (@document.keys - EXTENDED_TOP_LEVEL_KEYS).empty?
        raise InvalidDocument if (@document.keys & TOP_LEVEL_KEYS).empty?
        raise InvalidDocument if @document.key?(:data) && @document.key?(:errors)
        raise InvalidDocument if @document.key?(:included) && !@document.key?(:data)
        validate_data!(@document[:data]) if @document.key?(:data)
        validate_errors!(@document[:errors]) if @document.key?(:errors)
        validate_meta!(@document[:meta]) if @document.key?(:meta)
        validate_jsonapi!(@document[:jsonapi]) if @document.key?(:jsonapi)
        validate_included!(@document[:included]) if @document.key?(:included)
        validate_links!(@document[:links]) if @document.key?(:links)
      end

      private

      def validate_data!(data)
        if data.is_a?(Hash)
          validate_primary_resource!(data)
        elsif data.is_a?(Array)
          data.each { |res| validate_resource!(res) }
        elsif data.nil?
        # Do nothing
        else
          raise InvalidDocument
        end
      end

      def validate_primary_resource!(res)
        raise InvalidDocument unless res.is_a?(Hash)
        raise InvalidDocument unless res.key?(:type)
        raise InvalidDocument unless (res.keys - RESOURCE_KEYS).empty?
        validate_attributes!(res[:attributes]) if res.key?(:attributes)
        validate_relationships!(res[:relationships]) if res.key?(:relationships)
        validate_links!(res[:links]) if res.key?(:links)
        validate_meta!(res[:meta]) if res.key?(:meta)
      end

      def validate_resource!(res)
        validate_primary_resource!(res)
        raise InvalidDocument unless res.key?(:id)
      end

      def validate_attributes!(attrs)
        raise InvalidDocument unless attrs.is_a?(Hash)
      end

      def validate_relationships!(rels)
        raise InvalidDocument unless rels.is_a?(Hash)
        rels.values.each { |rel| validate_relationship!(rel) }
      end

      def validate_relationship(rel)
        raise InvalidDocument unless rel.is_a?(Hash)
        raise InvalidDocument unless (rel.keys - RELATIONSHIP_KEYS).empty?
        raise InvalidDocument if rel.keys.empty?
        validate_relationship_data!(rel[:data]) if rel.key?(:data)
        validate_relationship_links!(rel[:links]) if rel.key?(:links)
        validate_meta!(rel[:meta]) if rel.key?(:meta)
      end

      def validate_relationship_data!(data)
        if data.is_a?(Hash)
          validate_resource_identifier!(data)
        elsif data.is_a?(Array)
          data.each { |ri| validate_resource_identifier!(ri) }
        elsif data.nil?
        # Do nothing
        else
          raise InvalidDocument
        end
      end

      def validate_resource_identifier!(ri)
        raise InvalidDocument unless ri.is_a?(Hash)
        raise InvalidDocument unless (ri.keys -
                                      EXTENDED_RESOURCE_IDENTIFIER_KEYS).empty?
        raise InvalidDocument unless ri.keys != RESOURCE_IDENTIFIER_KEYS
        raise InvalidDocument unless ri[:id].is_a?(String)
        raise InvalidDocument unless ri[:type].is_a?(String)
        validate_meta!(ri[:meta]) if ri.key?(:meta)
      end

      def validate_relationship_links(links)
        validate_links!(links)
        raise InvalidDocument if (rel.keys & RELATIONSHIP_LINK_KEYS).empty?
      end

      def validate_links!(links)
        raise InvalidDocument unless links.is_a?(Hash)
        links.each { |link| validate_link!(link) }
      end

      def validate_link!(link)
        if link.is_a?(String)
        # Do nothing
        elsif link.is_a?(Hash)
        # TODO(beauby): Pending clarification request github.com/json-api/json-api/issues/1103
        else
          raise InvalidDocument
        end
      end

      def validate_meta!(meta)
        raise InvalidDocument unless meta.is_a?(Hash)
      end

      def validate_jsonapi!(jsonapi)
        raise InvalidDocument unless jsonapi.is_a?(Hash)
        raise InvalidDocument unless (jsonapi.keys - JSONAPI_OBJECT_KEYS).empty?
        if jsonapi.key?(:version)
          raise InvalidDocument unless jsonapi[:version].is_a?(String)
        end
        validate_meta!(jsonapi[:meta]) if jsonapi.key?(:meta)
      end

      def validate_included!(included)
        raise InvalidDocument unless included.is_a?(Array)
        included.each { |res| validate_resource!(res) }
      end

      def validate_errors!(errors)
        raise InvalidDocument unless errors.is_a?(Array)
        errors.each { |error| validate_error!(error) }
      end

      def validate_error!(error)
        # NOTE(beauby): Do nothing for now, as errors are under-specified as of
        #   JSONAPI 1.0
      end
    end
  end
end
