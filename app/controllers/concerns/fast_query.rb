module FastQuery
  extend ActiveSupport::Concern
  @@items_per_page = 20

  protected
  def query_params
    params.permit(:order_by, :order, :page_num, :search)
  end

  def render_with_total_items(current_query, render_options = nil)
    render_payload = { :json => current_query }
    render_payload = render_payload.merge(render_options) if render_options.is_a?(Hash)
    response.set_header("total-items", current_query.count)
    render render_payload and return
  end

  def to_bool(param)
    truthy = (param == "true" || param == true)
    return truthy
  end

  def query_to_bool(param, on_true, on_false)
    unless param.nil?
      to_bool(param) ? on_true : on_false
    end
  end

  def query_is_array(param, on_true, on_false)
    unless param.nil?
      param.kind_of?(Array) ? on_true : on_false
    end
  end

  module MongoidQuery
    include FastQuery

    private
    def query_resource(current_query)
      # Only works for Mongoid collections
      return current_query unless current_query.class == Mongoid::Criteria

      query_criteria = query_params()

      items_per_page = @@items_per_page

      # Normalize params
      page_num = query_criteria[:page_num].to_i || 0
      start_index = items_per_page * page_num
      sort_by = query_criteria[:order_by].nil? || query_criteria[:order_by].empty? ? :lastname : query_criteria[:order_by].to_sym
      order = query_criteria[:order].nil? || query_criteria[:order].empty? ? :asc : query_criteria[:order].to_sym

      # Search if needed. Raises error if search doesnt exist on class
      unless query_criteria[:search].nil? || query_criteria[:search].empty?
        q = current_query.klass.search(query_criteria[:search], current_query).sort_by(&sort_by)
        q.reverse! if order != :asc
        q.slice(start_index, items_per_page)
      else
        current_query.order_by(sort_by => order).skip(start_index).limit(items_per_page)
      end
    end

    def query_array_by_name(param, db_name)
      query_is_array(
        param,
        { db_name.in => param },
        { db_name => param }
      )
    end

    def query_bool_by_name(param, db_name)
      query_to_bool(
        param,
        { db_name => true },
        { db_name => false }
      )
    end

    def query_existance_by_name(param, db_name)
      query_to_bool(
        param,
        { db_name.ne => nil },
        { db_name => nil }
      )
    end
  end

  module BraintreeQuery
    include FastQuery

    private
    def query_array(param, search)
      query_is_array(
        param,
        search.in(param),
        search.is(param)
      )
    end
  end
end
